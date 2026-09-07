import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const MAX_RENAME_ATTEMPTS = 100;

const TARGET_OBJECT_DEFINITIONS = [
  {
    universalIdentifier:
      STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
    nameSingular: 'calendarEventTarget',
    namePlural: 'calendarEventTargets',
  },
  {
    universalIdentifier:
      STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
    nameSingular: 'messageThreadTarget',
    namePlural: 'messageThreadTargets',
  },
] as const;

const TARGET_OBJECT_UNIVERSAL_IDENTIFIERS = new Set<string>(
  TARGET_OBJECT_DEFINITIONS.map(
    ({ universalIdentifier }) => universalIdentifier,
  ),
);
const TARGET_OBJECT_NAMES = new Set<string>(
  TARGET_OBJECT_DEFINITIONS.flatMap(({ nameSingular, namePlural }) => [
    nameSingular,
    namePlural,
  ]),
);

const TARGET_RELATION_FIELD_DEFINITIONS = [
  {
    objectUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    universalIdentifier:
      STANDARD_OBJECTS.calendarEvent.fields.calendarEventTargets
        .universalIdentifier,
    name: 'calendarEventTargets',
  },
  {
    objectUniversalIdentifier:
      STANDARD_OBJECTS.messageThread.universalIdentifier,
    universalIdentifier:
      STANDARD_OBJECTS.messageThread.fields.messageThreadTargets
        .universalIdentifier,
    name: 'messageThreadTargets',
  },
  ...(['person', 'company', 'opportunity'] as const).flatMap((objectName) => [
    {
      objectUniversalIdentifier:
        STANDARD_OBJECTS[objectName].universalIdentifier,
      universalIdentifier:
        STANDARD_OBJECTS[objectName].fields.calendarEventTargets
          .universalIdentifier,
      name: 'calendarEventTargets',
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECTS[objectName].universalIdentifier,
      universalIdentifier:
        STANDARD_OBJECTS[objectName].fields.messageThreadTargets
          .universalIdentifier,
      name: 'messageThreadTargets',
    },
  ]),
] as const;

const findAvailableName = ({
  baseName,
  takenNames,
}: {
  baseName: string;
  takenNames: Set<string>;
}): string => {
  for (let attempt = 0; attempt < MAX_RENAME_ATTEMPTS; attempt++) {
    const suffix = attempt === 0 ? 'Old' : `Old${attempt + 1}`;
    const candidate = `${baseName}${suffix}`;

    if (!takenNames.has(candidate)) {
      takenNames.add(candidate);

      return candidate;
    }
  }

  throw new Error(
    `Could not find an available old name for ${baseName} after ${MAX_RENAME_ATTEMPTS} attempts`,
  );
};

export const buildTargetObjectCollisionRenameUpdates = ({
  flatObjectMetadataMaps,
  now,
}: {
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
  now: string;
}): FlatObjectMetadata[] => {
  const allObjects = Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const takenNames = new Set(
    allObjects.flatMap(({ nameSingular, namePlural }) => [
      nameSingular,
      namePlural,
    ]),
  );

  return allObjects
    .filter(
      (objectMetadata) =>
        !TARGET_OBJECT_UNIVERSAL_IDENTIFIERS.has(
          objectMetadata.universalIdentifier,
        ) &&
        [objectMetadata.nameSingular, objectMetadata.namePlural].some((name) =>
          TARGET_OBJECT_NAMES.has(name),
        ),
    )
    .map((objectMetadata) => ({
      ...objectMetadata,
      nameSingular: findAvailableName({
        baseName: objectMetadata.nameSingular,
        takenNames,
      }),
      namePlural: findAvailableName({
        baseName: objectMetadata.namePlural,
        takenNames,
      }),
      labelSingular: `${objectMetadata.labelSingular} (Old)`,
      labelPlural: `${objectMetadata.labelPlural} (Old)`,
      isLabelSyncedWithName: false,
      updatedAt: now,
    }));
};

export const buildTargetFieldCollisionRenameUpdates = ({
  flatFieldMetadataMaps,
  now,
}: {
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'byUniversalIdentifier'
  >;
  now: string;
}): FlatFieldMetadata[] => {
  const allFields = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const takenNamesByObjectUniversalIdentifier = new Map<string, Set<string>>();

  for (const fieldMetadata of allFields) {
    const takenNames =
      takenNamesByObjectUniversalIdentifier.get(
        fieldMetadata.objectMetadataUniversalIdentifier,
      ) ?? new Set<string>();

    takenNames.add(fieldMetadata.name);
    takenNamesByObjectUniversalIdentifier.set(
      fieldMetadata.objectMetadataUniversalIdentifier,
      takenNames,
    );
  }

  return TARGET_RELATION_FIELD_DEFINITIONS.flatMap((definition) =>
    allFields
      .filter(
        (fieldMetadata) =>
          fieldMetadata.objectMetadataUniversalIdentifier ===
            definition.objectUniversalIdentifier &&
          fieldMetadata.universalIdentifier !==
            definition.universalIdentifier &&
          fieldMetadata.name === definition.name,
      )
      .map((fieldMetadata) => ({
        ...fieldMetadata,
        name: findAvailableName({
          baseName: definition.name,
          takenNames:
            takenNamesByObjectUniversalIdentifier.get(
              definition.objectUniversalIdentifier,
            ) ?? new Set<string>(),
        }),
        label: `${fieldMetadata.label} (Old)`,
        isLabelSyncedWithName: false,
        updatedAt: now,
      })),
  );
};
