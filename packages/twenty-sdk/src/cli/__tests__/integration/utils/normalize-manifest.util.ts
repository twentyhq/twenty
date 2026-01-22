import { type ApplicationManifest } from 'twenty-shared/application';

// Replace dynamic checksum values and asset paths with placeholders for consistent comparisons
export const normalizeManifestForComparison = <
  T extends Partial<ApplicationManifest>,
>(
  manifest: T,
): T => ({
  ...manifest,
  functions: manifest.functions?.map((fn) => ({
    ...fn,
    builtHandlerChecksum: fn.builtHandlerChecksum ? '[checksum]' : null,
  })),
  frontComponents: manifest.frontComponents?.map((component) => ({
    ...component,
    builtComponentChecksum: component.builtComponentChecksum
      ? '[checksum]'
      : null,
    assets: component.assets?.map((asset) => ({
      ...asset,
      builtAssetChecksum: asset.builtAssetChecksum ? '[checksum]' : null,
      // Asset paths include a hash, so normalize them
      builtAssetPath: asset.builtAssetPath ? '[asset-path]' : null,
    })),
  })),
});
