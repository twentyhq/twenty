import { type Manifest } from 'twenty-shared/application';

import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';
import { resolveManifestAssetUrls } from 'src/engine/core-modules/application/application-marketplace/utils/resolve-manifest-asset-urls.util';

export const resolveRegistryManifestAssetUrls = ({
  manifest,
  packageName,
  version,
  cdnBaseUrl,
}: {
  manifest: Manifest;
  packageName: string;
  version: string;
  cdnBaseUrl: string;
}): Manifest =>
  resolveManifestAssetUrls(manifest, (filePath) =>
    buildRegistryCdnUrl({
      cdnBaseUrl,
      packageName,
      version,
      filePath,
    }),
  );
