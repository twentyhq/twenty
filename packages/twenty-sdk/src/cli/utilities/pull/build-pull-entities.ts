import {
  FIELD_ENUM_BINDINGS,
  INDEX_ENUM_BINDINGS,
  OBJECT_ENUM_BINDINGS,
  type EnumBinding,
} from '@/cli/utilities/pull/write-define-file';
import { kebabCase } from '@/cli/utilities/string/kebab-case';
import {
  type FieldManifest,
  type IndexManifest,
  type Manifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export const PULL_ENTITY_KINDS = [
  'application',
  'object',
  'field',
  'index',
] as const;

export type PullEntityKind = (typeof PULL_ENTITY_KINDS)[number];

export type PullEntity = {
  kind: PullEntityKind;
  universalIdentifier: string;
  definer: string;
  config: unknown;
  enumBindings: EnumBinding[];
  defaultFolder: string;
  fileSuffix: string;
  fileBaseName: string;
  parentName: string | null;
};

export type SkippedPullEntity = {
  kind: PullEntityKind;
  universalIdentifier: string;
  reason: string;
};

const APPLICATION_PROPERTIES_TO_STRIP = [
  'packageJsonChecksum',
  'yarnLockChecksum',
  'requiredServerVersionRange',
  'aboutDescription',
  'postInstallLogicFunction',
  'preInstallLogicFunction',
  'uninstallLogicFunction',
  'settingsFrontComponent',
  'settingsCustomTabFrontComponentUniversalIdentifier',
  'frontComponentSharedDependencies',
  'logoUrl',
  'screenshots',
] as const;

const GENERATED_COVER_GALLERY_IMAGE = 'public/cover.generated.png';

const STANDARD_OBJECT_NAME_BY_UNIVERSAL_IDENTIFIER = new Map<string, string>(
  Object.entries(STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS).map(
    ([name, universalIdentifier]) => [universalIdentifier, name] as const,
  ),
);

const buildApplicationConfig = (
  manifest: Manifest,
): Record<string, unknown> => {
  const applicationConfig: Record<string, unknown> = {
    ...(manifest.application as unknown as Record<string, unknown>),
  };

  for (const property of APPLICATION_PROPERTIES_TO_STRIP) {
    delete applicationConfig[property];
  }

  const galleryImages = applicationConfig.galleryImages;

  if (
    !Array.isArray(galleryImages) ||
    galleryImages.length === 0 ||
    galleryImages.every((image) => image === GENERATED_COVER_GALLERY_IMAGE)
  ) {
    delete applicationConfig.galleryImages;
  }

  return applicationConfig;
};

const getObjectName = ({
  objectUniversalIdentifier,
  manifest,
}: {
  objectUniversalIdentifier: string;
  manifest: Manifest;
}): string | null =>
  manifest.objects.find(
    (objectManifest) =>
      objectManifest.universalIdentifier === objectUniversalIdentifier,
  )?.nameSingular ??
  STANDARD_OBJECT_NAME_BY_UNIVERSAL_IDENTIFIER.get(objectUniversalIdentifier) ??
  null;

const buildIndexFileBaseName = ({
  indexManifest,
  objectName,
  fieldNameByUniversalIdentifier,
}: {
  indexManifest: IndexManifest;
  objectName: string | null;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): string => {
  const fieldNames = indexManifest.fields
    .map(({ fieldUniversalIdentifier }) =>
      fieldNameByUniversalIdentifier.get(fieldUniversalIdentifier),
    )
    .filter(isDefined);

  const segments = [objectName, ...fieldNames].filter(isDefined);

  return segments.length > 0
    ? segments.map(kebabCase).join('-')
    : indexManifest.universalIdentifier.slice(0, 8);
};

export const buildPullEntities = (
  manifest: Manifest,
): { entities: PullEntity[]; skipped: SkippedPullEntity[] } => {
  const applicationUniversalIdentifier =
    manifest.application.universalIdentifier;
  const entities: PullEntity[] = [];
  const skipped: SkippedPullEntity[] = [];

  entities.push({
    kind: 'application',
    universalIdentifier: applicationUniversalIdentifier,
    definer: 'defineApplication',
    config: buildApplicationConfig(manifest),
    enumBindings: [],
    defaultFolder: 'src',
    fileSuffix: '.config.ts',
    fileBaseName: 'application',
    parentName: null,
  });

  const writtenObjectUniversalIdentifiers = new Set<string>();
  const fieldNameByUniversalIdentifier = new Map<string, string>();

  for (const objectManifest of manifest.objects) {
    for (const field of objectManifest.fields) {
      fieldNameByUniversalIdentifier.set(field.universalIdentifier, field.name);
    }

    writtenObjectUniversalIdentifiers.add(objectManifest.universalIdentifier);

    entities.push({
      kind: 'object',
      universalIdentifier: objectManifest.universalIdentifier,
      definer: 'defineObject',
      config: objectManifest,
      enumBindings: OBJECT_ENUM_BINDINGS,
      defaultFolder: 'src/objects',
      fileSuffix: '.object.ts',
      fileBaseName: kebabCase(objectManifest.nameSingular),
      parentName: null,
    });
  }

  for (const fieldManifest of manifest.fields as FieldManifest[]) {
    fieldNameByUniversalIdentifier.set(
      fieldManifest.universalIdentifier,
      fieldManifest.name,
    );

    const objectName = getObjectName({
      objectUniversalIdentifier: fieldManifest.objectUniversalIdentifier,
      manifest,
    });

    entities.push({
      kind: 'field',
      universalIdentifier: fieldManifest.universalIdentifier,
      definer: 'defineField',
      config: fieldManifest,
      enumBindings: FIELD_ENUM_BINDINGS,
      defaultFolder: 'src/fields',
      fileSuffix: '.field.ts',
      fileBaseName: isDefined(objectName)
        ? `${kebabCase(objectName)}-${kebabCase(fieldManifest.name)}`
        : kebabCase(fieldManifest.name),
      parentName: objectName,
    });
  }

  for (const indexManifest of manifest.indexes ?? []) {
    if (
      !writtenObjectUniversalIdentifiers.has(
        indexManifest.objectUniversalIdentifier,
      )
    ) {
      skipped.push({
        kind: 'index',
        universalIdentifier: indexManifest.universalIdentifier,
        reason: 'its object is not part of the written source',
      });
      continue;
    }

    const objectName = getObjectName({
      objectUniversalIdentifier: indexManifest.objectUniversalIdentifier,
      manifest,
    });

    entities.push({
      kind: 'index',
      universalIdentifier: indexManifest.universalIdentifier,
      definer: 'defineIndex',
      config: indexManifest,
      enumBindings: INDEX_ENUM_BINDINGS,
      defaultFolder: 'src/indexes',
      fileSuffix: '.index.ts',
      fileBaseName: buildIndexFileBaseName({
        indexManifest,
        objectName,
        fieldNameByUniversalIdentifier,
      }),
      parentName: objectName,
    });
  }

  return { entities, skipped };
};
