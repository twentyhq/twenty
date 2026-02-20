import { type Manifest } from 'twenty-shared/application';

export const normalizeManifestForComparison = <T extends Manifest>(
  manifest: T,
): T => ({
  ...manifest,
  application: {
    ...manifest.application,
    yarnLockChecksum: manifest.application.yarnLockChecksum
      ? '[checksum]'
      : null,
    packageJsonChecksum: manifest.application.packageJsonChecksum
      ? '[checksum]'
      : null,
    apiClientChecksum: manifest.application.apiClientChecksum
      ? '[checksum]'
      : null,
  },
  logicFunctions: manifest.logicFunctions?.map((fn) => ({
    ...fn,
    builtHandlerChecksum: fn.builtHandlerChecksum ? '[checksum]' : null,
  })),
  frontComponents: manifest.frontComponents?.map((component) => ({
    ...component,
    builtComponentChecksum: component.builtComponentChecksum
      ? '[checksum]'
      : '',
  })),
});
