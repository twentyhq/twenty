import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { resolveApplicationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-logo-url.util';
import { resolveApplicationRegistrationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-registration-logo-url.util';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ApplicationRegistrationLogoService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly applicationService: ApplicationService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async resolveLogoUrl(
    registration: ApplicationRegistrationEntity,
  ): Promise<string | null> {
    if (
      registration.sourceType === ApplicationRegistrationSourceType.TARBALL &&
      registration.logoFileId
    ) {
      return this.fileUrlService.signFileByIdUrl({
        fileId: registration.logoFileId,
        workspaceId: registration.ownerWorkspaceId ?? '',
        fileFolder: FileFolder.AppTarball,
      });
    }

    const logo =
      registration.logo ?? registration.manifest?.application?.logoUrl ?? null;

    if (
      registration.sourceType === ApplicationRegistrationSourceType.LOCAL &&
      logo &&
      registration.ownerWorkspaceId
    ) {
      const application =
        await this.applicationService.findByUniversalIdentifier({
          universalIdentifier: registration.universalIdentifier,
          workspaceId: registration.ownerWorkspaceId,
        });

      if (application) {
        return resolveApplicationLogoUrl({
          logo,
          serverUrl: this.twentyConfigService.get('SERVER_URL'),
          workspaceId: registration.ownerWorkspaceId,
          applicationId: application.id,
        });
      }
    }

    return resolveApplicationRegistrationLogoUrl({
      logo,
      sourceType: registration.sourceType,
      sourcePackage: registration.sourcePackage,
      latestAvailableVersion: registration.latestAvailableVersion,
      cdnBaseUrl: this.twentyConfigService.get('APP_REGISTRY_CDN_URL'),
    });
  }
}
