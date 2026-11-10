import { type FieldMetadataType, type RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type DatabaseEventTriggerManifestField = {
  universalIdentifier: string;
  name: string;
  type: FieldMetadataType;
  objectUniversalIdentifier: string;
  universalSettings: FlatFieldMetadata['universalSettings'];
};

const readRelationType = (
  universalSettings: FlatFieldMetadata['universalSettings'],
): RelationType | undefined =>
  isDefined(universalSettings) && 'relationType' in universalSettings
    ? universalSettings.relationType
    : undefined;

// The app's own objects and fields first, then the workspace's
export const buildDatabaseEventTriggerManifestResolver = ({
  manifestFlatEntityMaps,
  existingFlatEntityMaps,
}: {
  manifestFlatEntityMaps: AllFlatEntityMaps;
  existingFlatEntityMaps: AllFlatEntityMaps;
}) => {
  const objectMaps = [
    manifestFlatEntityMaps.flatObjectMetadataMaps,
    existingFlatEntityMaps.flatObjectMetadataMaps,
  ];
  const fieldMaps = [
    manifestFlatEntityMaps.flatFieldMetadataMaps,
    existingFlatEntityMaps.flatFieldMetadataMaps,
  ];

  const findObjectNameSingular = (
    objectUniversalIdentifier: string,
  ): string | undefined =>
    objectMaps
      .map((maps) => maps.byUniversalIdentifier[objectUniversalIdentifier])
      .find(isDefined)?.nameSingular;

  const findObjectUniversalIdentifierByNameSingular = (
    nameSingular: string,
  ): string | undefined =>
    objectMaps
      .flatMap((maps) => Object.values(maps.byUniversalIdentifier))
      .find((object) => object?.nameSingular === nameSingular)
      ?.universalIdentifier;

  const toField = (
    field: AllFlatEntityMaps['flatFieldMetadataMaps']['byUniversalIdentifier'][string],
  ): DatabaseEventTriggerManifestField | undefined =>
    isDefined(field)
      ? {
          universalIdentifier: field.universalIdentifier,
          name: field.name,
          type: field.type,
          objectUniversalIdentifier: field.objectMetadataUniversalIdentifier,
          universalSettings: field.universalSettings,
        }
      : undefined;

  const findField = (
    fieldUniversalIdentifier: string,
  ): DatabaseEventTriggerManifestField | undefined =>
    fieldMaps
      .map((maps) =>
        toField(maps.byUniversalIdentifier[fieldUniversalIdentifier]),
      )
      .find(isDefined);

  const listObjectFields = (
    objectUniversalIdentifier: string,
  ): (DatabaseEventTriggerManifestField & {
    relationType?: RelationType;
  })[] => {
    const fieldsByUniversalIdentifier = new Map<
      string,
      DatabaseEventTriggerManifestField
    >();

    for (const maps of fieldMaps) {
      for (const field of Object.values(maps.byUniversalIdentifier)) {
        const manifestField = toField(field);

        if (
          isDefined(manifestField) &&
          manifestField.objectUniversalIdentifier ===
            objectUniversalIdentifier &&
          !fieldsByUniversalIdentifier.has(manifestField.universalIdentifier)
        ) {
          fieldsByUniversalIdentifier.set(
            manifestField.universalIdentifier,
            manifestField,
          );
        }
      }
    }

    return [...fieldsByUniversalIdentifier.values()].map((field) => ({
      ...field,
      relationType: readRelationType(field.universalSettings),
    }));
  };

  return {
    findObjectNameSingular,
    findObjectUniversalIdentifierByNameSingular,
    findField,
    listObjectFields,
  };
};

export type DatabaseEventTriggerManifestResolver = ReturnType<
  typeof buildDatabaseEventTriggerManifestResolver
>;
