import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/connection-provider/connections/services/application-connections-list.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SLACK_CONNECTION_PROVIDER_NAME } from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { type SlackApiResponse } from 'src/engine/core-modules/slack-assistant/types/slack-api-response.type';
import { callSlackApi } from 'src/engine/core-modules/slack-assistant/utils/call-slack-api.util';

const TEAM_WORKSPACE_CACHE_TTL_SECONDS = 24 * 60 * 60;
const TEAM_WORKSPACE_NEGATIVE_TTL_SECONDS = 60;
const NEGATIVE_CACHE_SENTINEL = '__none__';

type SlackAuthTestResponse = SlackApiResponse & {
  team_id?: string;
};

@Injectable()
export class SlackWorkspaceResolverService {
  private readonly logger = new Logger(SlackWorkspaceResolverService.name);

  constructor(
    @InjectRepository(ConnectionProviderEntity)
    private readonly connectionProviderRepository: Repository<ConnectionProviderEntity>,
    private readonly applicationConnectionsListService: ApplicationConnectionsListService,
    private readonly redisClientService: RedisClientService,
  ) {}
  // TODO: persist the Slack team_id (and enterprise_id) on the connection at
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
    const providers = await this.connectionProviderRepository.find({
      where: { name: SLACK_CONNECTION_PROVIDER_NAME },
    });
    const scopes = new Map<
      string,
      { workspaceId: string; applicationId: string }
    >();

    for (const provider of providers) {
      scopes.set(`${provider.workspaceId}:${provider.applicationId}`, {
        workspaceId: provider.workspaceId,
        applicationId: provider.applicationId,
      });
    }

    let matchedWorkspaceId: string | null = null;

    for (const { workspaceId, applicationId } of scopes.values()) {
      const connections = await this.applicationConnectionsListService.list({
        applicationId,
        workspaceId,
        requestUserWorkspaceId: null,
        filter: { providerName: SLACK_CONNECTION_PROVIDER_NAME },
      });

      for (const connection of connections) {
        const teamId = await this.fetchTeamId(connection.accessToken);

        if (!isNonEmptyString(teamId)) {
          continue;
        }

        await this.writeCache(teamId, workspaceId);

        if (teamId === targetTeamId) {
          matchedWorkspaceId = workspaceId;
        }
      }
    }

    if (!isDefined(matchedWorkspaceId)) {
      this.logger.warn(
        `No Slack connection matched team ${targetTeamId} after scanning ${scopes.size} workspace(s).`,
      );
    }

    return matchedWorkspaceId;
  }

  private async fetchTeamId(token: string): Promise<string | null> {
    try {
      const response = await callSlackApi<SlackAuthTestResponse>(
        'auth.test',
        {},
        token,
      );

      return response.ok ? (response.team_id ?? null) : null;
    } catch (error) {
      this.logger.warn(
        `Slack auth.test failed while resolving a team mapping: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
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
