import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type DatabaseEventTriggerManifestField = {
  universalIdentifier: string;
  name: string;
  type: FieldMetadataType;
  objectUniversalIdentifier: string;
  relationType?: RelationType;
  relationTargetObjectUniversalIdentifier?: string;
};

type FieldReadProperty =
  | 'universalIdentifier'
  | 'name'
  | 'type'
  | 'objectMetadataUniversalIdentifier'
  | 'universalSettings'
  | 'relationTargetObjectMetadataUniversalIdentifier';

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
  // System fields of a new object (id, createdAt...) are only added once it is created
  const reservedFieldsOfNewObjects: Record<string, UniversalFlatFieldMetadata> =
    Object.fromEntries(
      Object.values(
        manifestFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(
          (flatObjectMetadata) =>
            !isDefined(
              existingFlatEntityMaps.flatObjectMetadataMaps
                .byUniversalIdentifier[flatObjectMetadata.universalIdentifier],
            ),
        )
        .flatMap((flatObjectMetadata) =>
          Object.values(
            buildReservedSystemFlatFieldMetadatasForCustomObject({
              flatObjectMetadata,
            }),
          ),
        )
        .map((field) => [field.universalIdentifier, field]),
    );
  const fieldMaps: {
    byUniversalIdentifier: Partial<
      Record<string, Pick<UniversalFlatFieldMetadata, FieldReadProperty>>
    >;
  }[] = [
    manifestFlatEntityMaps.flatFieldMetadataMaps,
    { byUniversalIdentifier: reservedFieldsOfNewObjects },
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
    field: Pick<UniversalFlatFieldMetadata, FieldReadProperty> | undefined,
  ): DatabaseEventTriggerManifestField | undefined =>
    isDefined(field)
      ? {
          universalIdentifier: field.universalIdentifier,
          name: field.name,
          type: field.type,
          objectUniversalIdentifier: field.objectMetadataUniversalIdentifier,
          relationType: readRelationType(field.universalSettings),
          relationTargetObjectUniversalIdentifier:
            field.relationTargetObjectMetadataUniversalIdentifier ?? undefined,
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
  ): DatabaseEventTriggerManifestField[] => {
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

    return [...fieldsByUniversalIdentifier.values()];
  };

  const toScalarConditionField = ({
    name,
    type,
    universalIdentifier,
  }: Pick<
    DatabaseEventTriggerManifestField,
    'name' | 'type' | 'universalIdentifier'
  >): ValidationRuleFieldDescriptor => ({
    name,
    type,
    universalIdentifier,
  });

  const listConditionFields = (
    objectUniversalIdentifier: string,
  ): ValidationRuleFieldDescriptor[] =>
    listObjectFields(objectUniversalIdentifier).map((field) => {
      if (field.type !== FieldMetadataType.RELATION) {
        return toScalarConditionField(field);
      }

      return {
        ...toScalarConditionField(field),
        relationType: field.relationType,
        relationTargetFields:
          field.relationType === RelationType.MANY_TO_ONE &&
          isDefined(field.relationTargetObjectUniversalIdentifier)
            ? listObjectFields(
                field.relationTargetObjectUniversalIdentifier,
              ).map(toScalarConditionField)
            : undefined,
      };
    });

  return {
    findObjectNameSingular,
    findObjectUniversalIdentifierByNameSingular,
    findField,
    listConditionFields,
  };
};
