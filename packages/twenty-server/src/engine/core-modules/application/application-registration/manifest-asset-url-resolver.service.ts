import { Injectable } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';
import { resolveManifestAssetUrls } from 'src/engine/core-modules/application/application-marketplace/utils/resolve-manifest-asset-urls.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ManifestAssetUrlResolverService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  resolveFromRegistrySource({
    manifest,
    packageName,
    version,
  }: {
    manifest: Manifest;
    packageName: string;
    version: string;
  }): Manifest {
    const cdnBaseUrl = this.twentyConfigService.get('APP_REGISTRY_CDN_URL');

    return resolveManifestAssetUrls(manifest, (filePath) =>
      buildRegistryCdnUrl({ cdnBaseUrl, packageName, version, filePath }),
    );
  }

  resolveFromRegistration({
    sourceType,
    sourcePackage,
    manifest,
    version,
  }: {
    sourceType: ApplicationRegistrationSourceType;
    sourcePackage: string | null;
    manifest: Manifest;
    version: string;
  }): Manifest {
    if (
      sourceType !== ApplicationRegistrationSourceType.NPM ||
      !isDefined(sourcePackage)
    ) {
      return manifest;
    }

    return this.resolveFromRegistrySource({
      manifest,
      packageName: sourcePackage,
      version,
    });
  }
}
