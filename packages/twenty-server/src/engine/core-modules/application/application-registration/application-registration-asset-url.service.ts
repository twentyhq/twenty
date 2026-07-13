import { Injectable } from '@nestjs/common';

import { ServerFileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';
import { SERVER_FILE_STORAGE_PREFIX } from 'src/engine/core-modules/file-storage/constants/server-file-storage-prefix.constant';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { toGalleryImagePaths } from 'src/engine/core-modules/application/application-registration/utils/to-gallery-image-paths.util';
import { isAbsoluteUrl } from 'src/engine/core-modules/application/application-registration/utils/is-absolute-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type AssetSourceFields = Pick<
  ApplicationRegistrationEntity,
  'sourceType' | 'sourcePackage' | 'latestAvailableVersion'
>;

// Builds display URLs for application registration assets at query time.
// Assets stored as instance-global server files (TARBALL, LOCAL) are served by
// fileId; NPM assets are served straight from the registry CDN; absolute URLs
// pass through untouched.
@Injectable()
export class ApplicationRegistrationAssetUrlService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  buildLogoUrl(
    registration: AssetSourceFields &
      Pick<ApplicationRegistrationEntity, 'logo' | 'logoFileId'>,
  ): string | null {
    return this.resolveAssetUrl({
      fileId: registration.logoFileId,
      path: registration.logo,
      registration,
    });
  }

  buildGalleryImageUrls(
    registration: AssetSourceFields &
      Pick<
        ApplicationRegistrationEntity,
        'galleryImages' | 'screenshots' | 'manifest'
      >,
  ): string[] {
    // TODO: read galleryImages only, once the deprecated screenshots column
    // and manifest fallback are backfilled away.
    const galleryImages = isNonEmptyArray(registration.galleryImages)
      ? registration.galleryImages
      : this.toGalleryImageFallbackEntries(registration);

    return galleryImages
      .map(({ path, fileId }) =>
        this.resolveAssetUrl({ fileId, path, registration }),
      )
      .filter(isDefined);
  }

  private toGalleryImageFallbackEntries(
    registration: Pick<
      ApplicationRegistrationEntity,
      'screenshots' | 'manifest'
    >,
  ): { path: string; fileId: null }[] {
    const paths = isNonEmptyArray(registration.screenshots)
      ? registration.screenshots
      : toGalleryImagePaths(registration.manifest?.application);

    return paths.map((path) => ({ path, fileId: null }));
  }

  private resolveAssetUrl({
    fileId,
    path,
    registration,
  }: {
    fileId: string | null;
    path: string | null;
    registration: AssetSourceFields;
  }): string | null {
    if (isDefined(fileId)) {
      const serverUrl = this.twentyConfigService.get('SERVER_URL');

      return `${serverUrl}/file/${SERVER_FILE_STORAGE_PREFIX}/${ServerFileFolder.ApplicationRegistration}/${fileId}`;
    }

    if (!isDefined(path) || path.length === 0) {
      return null;
    }

    if (isAbsoluteUrl(path)) {
      return path;
    }

    if (
      registration.sourceType === ApplicationRegistrationSourceType.NPM &&
      isDefined(registration.sourcePackage) &&
      isDefined(registration.latestAvailableVersion)
    ) {
      return buildRegistryCdnUrl({
        cdnBaseUrl: this.twentyConfigService.get('APP_REGISTRY_CDN_URL'),
        packageName: registration.sourcePackage,
        version: registration.latestAvailableVersion,
        filePath: path,
      });
    }

    return null;
  }
}
