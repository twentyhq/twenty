import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { TWENTY_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';

@Injectable()
export class SlackApplicationResolverService {
  private readonly logger = new Logger(SlackApplicationResolverService.name);

  constructor(private readonly applicationService: ApplicationService) {}

  async findInstalledApplication(
    workspaceId: string,
  ): Promise<ApplicationEntity | null> {
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

    return application;
  }
}
