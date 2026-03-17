import { type Manifest } from 'twenty-shared/application';

const sortByUniversalIdentifier = <T extends { universalIdentifier: string }>(
  items: T[],
): T[] => [...items].sort((a, b) => a.universalIdentifier.localeCompare(b.universalIdentifier));

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
  fields: manifest.fields ? sortByUniversalIdentifier(manifest.fields) : [],
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
