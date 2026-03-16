import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import { Repository } from 'typeorm';
import { z } from 'zod';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const npmPackageMetadataSchema = z.object({
  version: z.string(),
});

@Injectable()
export class ApplicationUpgradeService {
  private readonly logger = new Logger(ApplicationUpgradeService.name);

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

      await this.appRegistrationRepository.update(appRegistration.id, {
        latestAvailableVersion: parsed.data.version,
      });

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

  async upgradeApplication(params: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: params.appRegistrationId },
    });

    if (
      appRegistration.sourceType === ApplicationRegistrationSourceType.LOCAL ||
      appRegistration.sourceType ===
        ApplicationRegistrationSourceType.TARBALL ||
      appRegistration.sourceType ===
        ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
      throw new ApplicationException(
        'Cannot upgrade an app installed from a tarball, local source, or OAuth-only registration',
        ApplicationExceptionCode.UPGRADE_FAILED,
      );
    }

    try {
      return await this.applicationInstallService.installApplication({
        appRegistrationId: params.appRegistrationId,
        version: params.targetVersion,
        workspaceId: params.workspaceId,
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
