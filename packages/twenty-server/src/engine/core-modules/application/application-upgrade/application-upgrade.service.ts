import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { z } from 'zod';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const npmPackageMetadataSchema = z.object({
  version: z.string(),
});

const UPGRADE_APPLICATIONS_DEFAULT_BATCH_SIZE = 5;

@Injectable()
export class ApplicationUpgradeService {
  private readonly logger = new Logger(ApplicationUpgradeService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async checkForUpdates(
    appRegistration: ApplicationRegistrationEntity,
  ): Promise<string | null> {
    if (appRegistration.sourceType !== ApplicationRegistrationSourceType.NPM) {
      return null;
    }

    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');

    if (!appRegistration.sourcePackage) {
      return null;
    }

    try {
      const encodedPackage = encodeURIComponent(appRegistration.sourcePackage);

      const { data } = await axios.get(
        `${registryUrl}/${encodedPackage}/latest`,
        {
          headers: { 'User-Agent': 'Twenty-AppUpgrade' },
          timeout: 10_000,
        },
      );

      const parsed = npmPackageMetadataSchema.safeParse(data);

      if (!parsed.success) {
        this.logger.warn(
          `Unexpected response shape from registry for ${appRegistration.sourcePackage}`,
        );

        return null;
      }

      const isNewVersion =
        await this.applicationRegistrationService.setLatestAvailableVersionIfChanged(
          appRegistration.id,
          parsed.data.version,
        );

      if (isNewVersion) {
        this.applicationRegistrationService.emitRegistrationPublishMetric({
          isNewRegistration: false,
          universalIdentifier: appRegistration.universalIdentifier,
          name: appRegistration.name,
          sourceType: appRegistration.sourceType,
          version: parsed.data.version,
        });

        await this.applicationRegistrationService.enqueueAutoUpgradeApplications(
          appRegistration.id,
        );
      }

      return parsed.data.version;
    } catch (error) {
      this.logger.warn(
        `Failed to check updates for ${appRegistration.sourcePackage}: ${error}`,
      );

      return null;
    }
  }

  async checkAllForUpdates(): Promise<void> {
    const npmRegistrations = await this.appRegistrationRepository.find({
      where: { sourceType: ApplicationRegistrationSourceType.NPM },
    });

    for (const registration of npmRegistrations) {
      await this.checkForUpdates(registration);
    }
  }

  async findApplicationsToUpgrade({
    applicationRegistrationId,
    onlyAutoUpgrade = false,
    workspaceIds,
    workspaceCountLimit,
  }: {
    applicationRegistrationId: string;
    onlyAutoUpgrade?: boolean;
    workspaceIds?: string[];
    workspaceCountLimit?: number;
  }): Promise<{
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string | null;
    applicationsToUpgrade: ApplicationEntity[];
  }> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: applicationRegistrationId },
    });

    const targetVersion = appRegistration.latestAvailableVersion;

    if (!isDefined(targetVersion)) {
      return {
        appRegistration,
        targetVersion: null,
        applicationsToUpgrade: [],
      };
    }

    const applications = await this.applicationRepository.find({
      where: {
        applicationRegistrationId,
        ...(onlyAutoUpgrade ? { autoUpgrade: true } : {}),
        ...(isNonEmptyArray(workspaceIds)
          ? { workspaceId: In(workspaceIds) }
          : {}),
      },
    });

    let applicationsToUpgrade = applications.filter(
      (application) => application.version !== targetVersion,
    );

    if (isDefined(workspaceCountLimit)) {
      applicationsToUpgrade = applicationsToUpgrade.slice(
        0,
        workspaceCountLimit,
      );
    }

    return { appRegistration, targetVersion, applicationsToUpgrade };
  }

  async upgradeApplications({
    appRegistration,
    targetVersion,
    applications,
    batchSize = UPGRADE_APPLICATIONS_DEFAULT_BATCH_SIZE,
  }: {
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string;
    applications: ApplicationEntity[];
    batchSize?: number;
  }): Promise<void> {
    const sanitizedBatchSize = Math.max(1, Math.floor(batchSize));

    for (
      let batchStart = 0;
      batchStart < applications.length;
      batchStart += sanitizedBatchSize
    ) {
      const batch = applications.slice(
        batchStart,
        batchStart + sanitizedBatchSize,
      );

      await Promise.all(
        batch.map(async (application) => {
          try {
            await this.upgradeApplicationToVersion({
              appRegistration,
              targetVersion,
              workspaceId: application.workspaceId,
            });
          } catch (error) {
            this.logger.error(
              `Failed to upgrade application ${application.id} to version ${targetVersion} in workspace ${application.workspaceId}`,
              error,
            );
          }
        }),
      );
    }
  }

  async upgradeAllApplications({
    applicationRegistrationId,
    onlyAutoUpgrade = false,
    batchSize = UPGRADE_APPLICATIONS_DEFAULT_BATCH_SIZE,
    workspaceIds,
    workspaceCountLimit,
  }: {
    applicationRegistrationId: string;
    onlyAutoUpgrade?: boolean;
    batchSize?: number;
    workspaceIds?: string[];
    workspaceCountLimit?: number;
  }): Promise<void> {
    const { appRegistration, targetVersion, applicationsToUpgrade } =
      await this.findApplicationsToUpgrade({
        applicationRegistrationId,
        onlyAutoUpgrade,
        workspaceIds,
        workspaceCountLimit,
      });

    if (!isDefined(targetVersion)) {
      return;
    }

    await this.upgradeApplications({
      appRegistration,
      targetVersion,
      applications: applicationsToUpgrade,
      batchSize,
    });
  }

  async upgradeApplication(params: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: params.appRegistrationId },
    });

    return this.upgradeApplicationToVersion({
      appRegistration,
      targetVersion: params.targetVersion,
      workspaceId: params.workspaceId,
      skipWorkspaceCompatibilityCheck: params.skipWorkspaceCompatibilityCheck,
    });
  }

  private async upgradeApplicationToVersion(params: {
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
  }): Promise<boolean> {
    const { appRegistration } = params;

    // LOCAL apps are updated by dev sync and OAUTH_ONLY registrations have no
    // code artifacts.
    if (
      appRegistration.sourceType === ApplicationRegistrationSourceType.LOCAL ||
      appRegistration.sourceType ===
        ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
      throw new ApplicationException(
        'Cannot upgrade an app installed from a local source or OAuth-only registration',
        ApplicationExceptionCode.UPGRADE_FAILED,
      );
    }

    try {
      return await this.applicationInstallService.installApplication({
        appRegistrationId: appRegistration.id,
        version: params.targetVersion,
        workspaceId: params.workspaceId,
        skipWorkspaceCompatibilityCheck: params.skipWorkspaceCompatibilityCheck,
      });
    } catch (error) {
      const appName =
        appRegistration.sourcePackage ?? appRegistration.universalIdentifier;

      this.logger.error(`Upgrade failed for ${appName}`, error);

      if (error instanceof ApplicationException) {
        throw error;
      }

      throw new ApplicationException(
        `Upgrade failed for ${appName}`,
        ApplicationExceptionCode.UPGRADE_FAILED,
      );
    }
  }
}
