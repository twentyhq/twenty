import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { resolveApplicationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-logo-url.util';
import { resolveApplicationRegistrationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-registration-logo-url.util';
import { type FileOutputDTO } from 'src/engine/core-modules/file/dtos/file-output.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { buildFileOutputFromUrl } from 'src/engine/core-modules/file/utils/build-file-output-from-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ApplicationRegistrationLogoService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly applicationService: ApplicationService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async resolveLogoFile(
    registration: ApplicationRegistrationEntity,
  ): Promise<FileOutputDTO | null> {
    if (
      registration.sourceType === ApplicationRegistrationSourceType.TARBALL &&
      registration.logoFileId
    ) {
      const url = await this.fileUrlService.signFileByIdUrl({
        fileId: registration.logoFileId,
        workspaceId: registration.ownerWorkspaceId ?? '',
        fileFolder: FileFolder.AppTarball,
      });

      return buildFileOutputFromUrl(url, registration.logoFileId);
    }

    const manifestLogo = registration.manifest?.application?.logoUrl ?? null;

    if (
      registration.sourceType === ApplicationRegistrationSourceType.LOCAL &&
      manifestLogo &&
      registration.ownerWorkspaceId
    ) {
      const application =
        await this.applicationService.findByUniversalIdentifier({
          universalIdentifier: registration.universalIdentifier,
          workspaceId: registration.ownerWorkspaceId,
        });

      if (application) {
        return buildFileOutputFromUrl(
          resolveApplicationLogoUrl({
            logo: manifestLogo,
            serverUrl: this.twentyConfigService.get('SERVER_URL'),
            workspaceId: registration.ownerWorkspaceId,
            applicationId: application.id,
          }),
        );
      }
    }

    return buildFileOutputFromUrl(
      resolveApplicationRegistrationLogoUrl({
        logo: manifestLogo,
        sourceType: registration.sourceType,
        sourcePackage: registration.sourcePackage,
        latestAvailableVersion: registration.latestAvailableVersion,
        cdnBaseUrl: this.twentyConfigService.get('APP_REGISTRY_CDN_URL'),
      }),
    );
  }
}
