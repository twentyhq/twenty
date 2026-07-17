import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/connection-provider/connections/services/application-connections-list.service';
import {
  SLACK_CONNECTION_PROVIDER_NAME,
  TWENTY_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { fetchSlackTeamId } from 'src/engine/core-modules/slack-assistant/utils/fetch-slack-team-id.util';

@Injectable()
export class SlackConnectionService {
  private readonly logger = new Logger(SlackConnectionService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationConnectionsListService: ApplicationConnectionsListService,
  ) {}

  async getBotToken({
    workspaceId,
    teamId,
  }: {
    workspaceId: string;
    teamId?: string;
  }): Promise<string | null> {
    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: TWENTY_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId,
      },
    );

    if (!isDefined(application)) {
      this.logger.warn(
        `twenty-slack is not installed in workspace ${workspaceId}.`,
      );

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
