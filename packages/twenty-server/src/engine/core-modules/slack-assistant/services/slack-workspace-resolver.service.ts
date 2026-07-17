import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/connection-provider/connections/services/application-connections-list.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import {
  SLACK_CONNECTION_PROVIDER_NAME,
  TWENTY_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { fetchSlackTeamId } from 'src/engine/core-modules/slack-assistant/utils/fetch-slack-team-id.util';

const TEAM_WORKSPACE_CACHE_TTL_SECONDS = 24 * 60 * 60;
const TEAM_WORKSPACE_NEGATIVE_TTL_SECONDS = 60;
const NEGATIVE_CACHE_SENTINEL = '__none__';

@Injectable()
export class SlackWorkspaceResolverService {
  private readonly logger = new Logger(SlackWorkspaceResolverService.name);

  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationConnectionsListService: ApplicationConnectionsListService,
    private readonly redisClientService: RedisClientService,
  ) {}

  // TODO: persist the Slack team_id (and enterprise_id) on the connection at
  // connect time so resolution is a direct lookup instead of scanning every
  // install and calling auth.test per connection. enterprise_id is threaded
  // through for future Enterprise Grid resolution but is not used yet.
  async resolveWorkspaceId({
    teamId,
  }: {
    teamId: string;
    enterpriseId?: string;
  }): Promise<string | null> {
    const cached = await this.readCache(teamId);

    if (isDefined(cached)) {
      return cached === NEGATIVE_CACHE_SENTINEL ? null : cached;
    }

    const resolved = await this.rebuildMappingForTeam(teamId);

    await this.writeCache(teamId, resolved);

    return resolved;
  }

  private async rebuildMappingForTeam(
    targetTeamId: string,
  ): Promise<string | null> {
    const applications = await this.applicationRepository.find({
      where: {
        universalIdentifier: TWENTY_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    });

    const workspaceIdsByTeamId = new Map<string, Set<string>>();

    for (const application of applications) {
      const connections = await this.applicationConnectionsListService.list({
        applicationId: application.id,
        workspaceId: application.workspaceId,
        requestUserWorkspaceId: null,
        filter: { providerName: SLACK_CONNECTION_PROVIDER_NAME },
      });

      for (const connection of connections) {
        const teamId = await fetchSlackTeamId(connection.accessToken);

        if (!isNonEmptyString(teamId)) {
          continue;
        }

        const workspaceIds =
          workspaceIdsByTeamId.get(teamId) ?? new Set<string>();

        workspaceIds.add(application.workspaceId);
        workspaceIdsByTeamId.set(teamId, workspaceIds);
      }
    }

    for (const [teamId, workspaceIds] of workspaceIdsByTeamId) {
      if (workspaceIds.size === 1) {
        await this.writeCache(teamId, [...workspaceIds][0]);
      }
    }

    const targetWorkspaceIds = workspaceIdsByTeamId.get(targetTeamId);

    if (!isDefined(targetWorkspaceIds) || targetWorkspaceIds.size === 0) {
      this.logger.warn(
        `No Slack connection matched team ${targetTeamId} after scanning ${applications.length} install(s).`,
      );

      return null;
    }

    if (targetWorkspaceIds.size > 1) {
      this.logger.error(
        `Slack team ${targetTeamId} resolves to ${targetWorkspaceIds.size} workspaces; refusing to route ambiguously.`,
      );

      return null;
    }

    return [...targetWorkspaceIds][0];
  }

  private getCacheKey(teamId: string): string {
    return `slack-assistant:team-workspace:${teamId}`;
  }

  private async readCache(teamId: string): Promise<string | null> {
    return this.redisClientService.getClient().get(this.getCacheKey(teamId));
  }

  private async writeCache(
    teamId: string,
    workspaceId: string | null,
  ): Promise<void> {
    await this.redisClientService
      .getClient()
      .set(
        this.getCacheKey(teamId),
        workspaceId ?? NEGATIVE_CACHE_SENTINEL,
        'EX',
        isDefined(workspaceId)
          ? TEAM_WORKSPACE_CACHE_TTL_SECONDS
          : TEAM_WORKSPACE_NEGATIVE_TTL_SECONDS,
      );
  }
}
