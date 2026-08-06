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
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';

@Processor(MessageQueue.workspaceQueue)
export class InstallOnboardingAppsJob {
  private readonly logger = new Logger(InstallOnboardingAppsJob.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly onboardingService: OnboardingService,
  ) {}

  @Process(INSTALL_ONBOARDING_APPS_JOB_NAME)
  async handle({
    workspaceId,
    universalIdentifiers,
    userId,
  }: InstallOnboardingAppsJobData): Promise<void> {
    await this.onboardingService.creditInstallAppsReward({
      workspaceId,
      rewardAppsCount: universalIdentifiers.length,
    });

    let hasInstalledAnyApp = false;

    for (const universalIdentifier of universalIdentifiers) {
      const hasInstalledApp = await this.installApp({
        universalIdentifier,
        workspaceId,
      });

      hasInstalledAnyApp = hasInstalledAnyApp || hasInstalledApp;
    }

    if (isDefined(userId) && hasInstalledAnyApp) {
      await this.onboardingService.clearReversibleOnboardingStepHistoryAfterAppsInstalled(
        { userId, workspaceId },
      );
    }
  }

  private async installApp({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<boolean> {
    try {
      const registration =
        await this.applicationRegistrationService.findOneByUniversalIdentifier(
          universalIdentifier,
        );

      if (!isDefined(registration)) {
        this.logger.error(
          `Onboarding app ${universalIdentifier} not found while installing for workspace ${workspaceId}`,
        );

        return false;
      }

      await this.applicationInstallService.installApplication({
        appRegistrationId: registration.id,
        workspaceId,
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to install onboarding app ${universalIdentifier} for workspace ${workspaceId}`,
        error,
      );

      return false;
    }
  }
}
