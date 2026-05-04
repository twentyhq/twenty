import { type Manifest } from 'twenty-shared/application';

const sortById = <T extends { universalIdentifier: string }>(items: T[]): T[] =>
  [...items].sort((a, b) =>
    a.universalIdentifier.localeCompare(b.universalIdentifier),
  );

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
  },
  objects: sortById(
    manifest.objects.map((object) => ({
      ...object,
      fields: sortById(object.fields),
    })),
  ),
  fields: sortById(manifest.fields),
  roles: sortById(manifest.roles),
  skills: sortById(manifest.skills),
  agents: sortById(manifest.agents),
  connectionProviders: sortById(manifest.connectionProviders ?? []),
  views: sortById(manifest.views),
  navigationMenuItems: sortById(manifest.navigationMenuItems),
  pageLayouts: sortById(manifest.pageLayouts),
  pageLayoutTabs: sortById(manifest.pageLayoutTabs ?? []),
  logicFunctions: sortById(
    manifest.logicFunctions?.map((fn) => ({
      ...fn,
      builtHandlerChecksum: fn.builtHandlerChecksum ? '[checksum]' : null,
    })),
  ),
  frontComponents: sortById(
    manifest.frontComponents?.map((component) => ({
      ...component,
      builtComponentChecksum: component.builtComponentChecksum
        ? '[checksum]'
        : '',
    })),
  ),
});
