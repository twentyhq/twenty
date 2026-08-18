import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  APP_CONNECTION_CREATED_EVENT,
  type AppConnectionCreatedEvent,
} from 'src/engine/core-modules/application/connection-provider/types/app-connection-created.event';
import { ONBOARDING_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/engine/core-modules/onboarding/constants/onboarding-slack-application.constant';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';

@Injectable()
export class OnboardingSlackConnectionListener {
  private readonly logger = new Logger(OnboardingSlackConnectionListener.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly onboardingService: OnboardingService,
  ) {}

  @OnEvent(APP_CONNECTION_CREATED_EVENT)
  async handleAppConnectionCreated(event: AppConnectionCreatedEvent) {
    try {
      const application =
        await this.applicationService.findByUniversalIdentifier({
          universalIdentifier:
            ONBOARDING_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
          workspaceId: event.workspaceId,
        });

      if (!isDefined(application) || application.id !== event.applicationId) {
        return;
      }

      await this.onboardingService.completeOnboardingConnectSlackStep({
        userId: event.userId,
        workspaceId: event.workspaceId,
      });
    } catch (error) {
      // A failure here only means the user sees the connect step once more;
      // the Slack connection itself is already persisted.
      this.logger.error(
        `Failed to complete the Slack onboarding step for workspace ${event.workspaceId}`,
        error,
      );
    }
  }
}
