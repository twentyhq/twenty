import { type ApplicationManifest } from 'twenty-shared/application';

// Replace dynamic checksum values with a placeholder for consistent comparisons
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
  })),
});
