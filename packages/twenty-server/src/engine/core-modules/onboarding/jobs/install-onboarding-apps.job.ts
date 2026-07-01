import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  INSTALL_ONBOARDING_APPS_JOB_NAME,
  type InstallOnboardingAppsJobData,
} from 'src/engine/core-modules/onboarding/jobs/install-onboarding-apps.job-constants';

@Processor(MessageQueue.workspaceQueue)
export class InstallOnboardingAppsJob {
  private readonly logger = new Logger(InstallOnboardingAppsJob.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationInstallService: ApplicationInstallService,
  ) {}

  @Process(INSTALL_ONBOARDING_APPS_JOB_NAME)
  async handle({
    workspaceId,
    universalIdentifiers,
  }: InstallOnboardingAppsJobData): Promise<void> {
    await Promise.all(
      universalIdentifiers.map(async (universalIdentifier) => {
        try {
          const registration =
            await this.applicationRegistrationService.findOneByUniversalIdentifier(
              universalIdentifier,
            );

          if (!isDefined(registration)) {
            this.logger.error(
              `Onboarding app ${universalIdentifier} not found while installing for workspace ${workspaceId}`,
            );

            return;
          }

          await this.applicationInstallService.installApplication({
            appRegistrationId: registration.id,
            workspaceId,
          });
        } catch (error) {
          this.logger.error(
            `Failed to install onboarding app ${universalIdentifier} for workspace ${workspaceId}`,
            error,
          );
        }
      }),
    );
  }
}
