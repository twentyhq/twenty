import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  ApplicationRegistrationEntity,
  AppRegistrationSourceType,
} from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationInstallService } from 'src/engine/core-modules/application/services/application-install.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AppUpgradeService {
  private readonly logger = new Logger(AppUpgradeService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async checkForUpdates(
    appRegistration: ApplicationRegistrationEntity,
  ): Promise<string | null> {
    if (appRegistration.sourceType !== AppRegistrationSourceType.NPM) {
      return null;
    }

    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');

    if (!appRegistration.sourcePackage) {
      return null;
    }

    try {
      const encodedPackage = encodeURIComponent(appRegistration.sourcePackage);

      const response = await fetch(`${registryUrl}/${encodedPackage}/latest`, {
        headers: { 'User-Agent': 'Twenty-AppUpgrade' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        this.logger.warn(
          `Version check failed for ${appRegistration.sourcePackage}: ${response.status}`,
        );

        return null;
      }

      const metadata = (await response.json()) as Record<string, unknown>;
      const latestVersion = metadata.version;

      if (typeof latestVersion !== 'string') {
        this.logger.warn(
          `Unexpected response shape from registry for ${appRegistration.sourcePackage}`,
        );

        return null;
      }

      await this.appRegistrationRepository.update(appRegistration.id, {
        latestAvailableVersion: latestVersion,
      });

      return latestVersion;
    } catch (error) {
      this.logger.warn(
        `Failed to check updates for ${appRegistration.sourcePackage}: ${error}`,
      );

      return null;
    }
  }

  async checkAllForUpdates(): Promise<void> {
    const npmRegistrations = await this.appRegistrationRepository.find({
      where: { sourceType: AppRegistrationSourceType.NPM },
    });

    for (const registration of npmRegistrations) {
      await this.checkForUpdates(registration);
    }
  }

  async upgradeApplication(params: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: params.appRegistrationId },
    });

    if (appRegistration.sourceType === AppRegistrationSourceType.LOCAL) {
      throw new ApplicationException(
        'Cannot upgrade an app with no source channel',
        ApplicationExceptionCode.UPGRADE_FAILED,
      );
    }

    const application = await this.applicationRepository.findOne({
      where: {
        applicationRegistrationId: params.appRegistrationId,
        workspaceId: params.workspaceId,
      },
    });

    const previousVersion = application?.version ?? null;

    try {
      return await this.applicationInstallService.installApplication({
        appRegistrationId: params.appRegistrationId,
        version: params.targetVersion,
        workspaceId: params.workspaceId,
      });
    } catch (error) {
      const appName =
        appRegistration.sourcePackage ?? appRegistration.universalIdentifier;

      this.logger.error(
        `Upgrade to ${params.targetVersion} failed for ${appName}, ` +
          `rolling back to ${previousVersion ?? 'unknown'}`,
      );

      // Rollback is only possible for npm apps where we can re-fetch the old version
      if (
        previousVersion &&
        appRegistration.sourceType === AppRegistrationSourceType.NPM
      ) {
        try {
          await this.applicationInstallService.installApplication({
            appRegistrationId: params.appRegistrationId,
            version: previousVersion,
            workspaceId: params.workspaceId,
          });

          this.logger.log(
            `Rollback to ${previousVersion} succeeded for ${appName}`,
          );
        } catch (rollbackError) {
          this.logger.error(
            `Rollback also failed for ${appName}: ${rollbackError}`,
          );
        }
      }

      throw new ApplicationException(
        `Upgrade failed for ${appName}: ${error}`,
        ApplicationExceptionCode.UPGRADE_FAILED,
      );
    }
  }
}
