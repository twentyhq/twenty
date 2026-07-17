import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/connection-provider/connections/services/application-connections-list.service';
import { SLACK_CONNECTION_PROVIDER_NAME } from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { SlackApplicationResolverService } from 'src/engine/core-modules/slack-assistant/services/slack-application-resolver.service';
import { fetchSlackTeamId } from 'src/engine/core-modules/slack-assistant/utils/fetch-slack-team-id.util';

@Injectable()
export class SlackConnectionService {
  private readonly logger = new Logger(SlackConnectionService.name);

  constructor(
    private readonly slackApplicationResolverService: SlackApplicationResolverService,
    private readonly applicationConnectionsListService: ApplicationConnectionsListService,
  ) {}

  async getBotToken({
    workspaceId,
    teamId,
  }: {
    workspaceId: string;
    teamId?: string;
  }): Promise<string | null> {
    const application =
      await this.slackApplicationResolverService.findInstalledApplication(
        workspaceId,
      );

    if (!isDefined(application)) {
      return null;
    }

    const connections = await this.applicationConnectionsListService.list({
      applicationId: application.id,
      workspaceId,
      requestUserWorkspaceId: null,
      filter: { providerName: SLACK_CONNECTION_PROVIDER_NAME },
    });

    if (connections.length === 0) {
      return null;
    }

    if (connections.length === 1) {
      return connections[0].accessToken;
    }

    if (isNonEmptyString(teamId)) {
      for (const connection of connections) {
        const connectionTeamId = await fetchSlackTeamId(connection.accessToken);

        if (connectionTeamId === teamId) {
          return connection.accessToken;
        }
      }

      this.logger.warn(
        `No Slack connection in workspace ${workspaceId} matched team ${teamId}; using the default connection.`,
      );
    }

    const fallbackConnection =
      connections.find((item) => item.visibility === 'workspace') ??
      connections[0];

    return fallbackConnection?.accessToken ?? null;
  }
}
