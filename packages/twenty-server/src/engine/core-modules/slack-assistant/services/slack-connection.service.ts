import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/connection-provider/connections/services/application-connections-list.service';
import {
  SLACK_CONNECTION_PROVIDER_NAME,
  TWENTY_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';

@Injectable()
export class SlackConnectionService {
  private readonly logger = new Logger(SlackConnectionService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationConnectionsListService: ApplicationConnectionsListService,
  ) {}

  async getBotToken(workspaceId: string): Promise<string | null> {
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

    const connection =
      connections.find((item) => item.visibility === 'workspace') ??
      connections[0];

    return connection?.accessToken ?? null;
  }
}
