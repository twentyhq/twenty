import {
  type FieldManifest,
  type Manifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

const sortById = <T extends { universalIdentifier: string }>(items: T[]): T[] =>
  [...items].sort((a, b) =>
    a.universalIdentifier.localeCompare(b.universalIdentifier),
  );

// Select / multi-select option ids may be auto-generated when not provided in
// the source, so they are non-deterministic across builds. Mask them here so
// the snapshot stays stable; the actual id-injection behavior is asserted by
// dedicated tests against the raw (non-normalized) manifest.
const maskSelectOptionIds = <T extends FieldManifest | ObjectFieldManifest>(
  field: T,
): T => {
  if (
    field.type !== FieldMetadataType.SELECT &&
    field.type !== FieldMetadataType.MULTI_SELECT
  ) {
    return field;
  }

  if (field.options === undefined || field.options === null) {
    return field;
  }

  return {
    ...field,
    options: field.options.map((option) => ({
      ...option,
      id: '[option-id]',
    })),
  };
};

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
      fields: sortById(object.fields.map(maskSelectOptionIds)),
    })),
  ),
  fields: sortById(manifest.fields.map(maskSelectOptionIds)),
  roles: sortById(manifest.roles),
  skills: sortById(manifest.skills),
  agents: sortById(manifest.agents),
  views: sortById(manifest.views),
  navigationMenuItems: sortById(manifest.navigationMenuItems),
  pageLayouts: sortById(manifest.pageLayouts),
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
