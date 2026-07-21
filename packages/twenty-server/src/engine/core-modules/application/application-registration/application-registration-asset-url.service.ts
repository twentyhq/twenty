import { Injectable } from '@nestjs/common';

import { isAbsoluteUrl, isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { toGalleryImagePaths } from 'src/engine/core-modules/application/application-registration/utils/to-gallery-image-paths.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type AssetSourceFields = Pick<
  ApplicationRegistrationEntity,
  'id' | 'sourceType' | 'sourcePackage' | 'latestAvailableVersion'
>;

// Builds display URLs for application registration assets at query time.
// Assets stored as instance-global server files (TARBALL, LOCAL, rehosted NPM)
// are served path-addressed under /files/application-registrations; NPM assets
// not yet rehosted are served straight from the registry CDN; absolute URLs
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
    if (!isDefined(path) || path.length === 0) {
      return null;
    }

    // A fileId marks the path as stored in server file storage.
    if (isDefined(fileId)) {
      const serverUrl = this.twentyConfigService.get('SERVER_URL');

      // Encode segments so URL-reserved characters (#, ?, spaces) in file
      // names survive; directory separators are kept as route path segments.
      const encodedPath = path
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');

      return `${serverUrl}/files/application-registrations/${registration.id}/${encodedPath}`;
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
