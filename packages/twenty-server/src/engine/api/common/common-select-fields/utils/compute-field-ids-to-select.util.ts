import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const CAPPED_FIELD_SET_PRIORITY_SYSTEM_FIELD_NAMES = [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'position',
];

type FieldIdsToSelectFlatObjectMetadata = Pick<
  FlatObjectMetadata,
  | 'fieldIds'
  | 'labelIdentifierFieldMetadataId'
  | 'imageIdentifierFieldMetadataId'
  | 'applicationId'
  | 'applicationUniversalIdentifier'
>;

type FieldIdsToSelectFlatFieldMetadata = Pick<
  OrmFlatFieldMetadata,
  'id' | 'universalIdentifier' | 'applicationId' | 'workspaceId' | 'name'
>;

export type FieldIdsToSelect = {
  fieldIdsToSelect: Set<string> | undefined;
  isDefaultFieldSetCapped: boolean;
};

const compareFieldNames = (
  firstFieldName: string,
  secondFieldName: string,
): number => {
  if (firstFieldName < secondFieldName) return -1;
  if (firstFieldName > secondFieldName) return 1;

  return 0;
};

const sortFlatFieldsByCappedFieldSetPriority = ({
  readableFlatFields,
  flatObjectMetadata,
}: {
  readableFlatFields: FieldIdsToSelectFlatFieldMetadata[];
  flatObjectMetadata: FieldIdsToSelectFlatObjectMetadata;
}): FieldIdsToSelectFlatFieldMetadata[] => {
  const readableFlatFieldByName = new Map(
    readableFlatFields.map((flatField) => [flatField.name, flatField]),
  );
  const readableFlatFieldById = new Map(
    readableFlatFields.map((flatField) => [flatField.id, flatField]),
  );

  const priorityFlatFields = [
    readableFlatFieldByName.get('id'),
    isDefined(flatObjectMetadata.labelIdentifierFieldMetadataId)
      ? readableFlatFieldById.get(
          flatObjectMetadata.labelIdentifierFieldMetadataId,
        )
      : undefined,
    isDefined(flatObjectMetadata.imageIdentifierFieldMetadataId)
      ? readableFlatFieldById.get(
          flatObjectMetadata.imageIdentifierFieldMetadataId,
        )
      : undefined,
    ...CAPPED_FIELD_SET_PRIORITY_SYSTEM_FIELD_NAMES.map((fieldName) =>
      readableFlatFieldByName.get(fieldName),
    ),
  ].filter(isDefined);

  const uniquePriorityFlatFields = [...new Set(priorityFlatFields)];
  const priorityFlatFieldIds = new Set(
    uniquePriorityFlatFields.map((flatField) => flatField.id),
  );

  const isStandardObject =
    flatObjectMetadata.applicationUniversalIdentifier ===
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

  const isStandardField = (flatField: FieldIdsToSelectFlatFieldMetadata) =>
    isStandardObject &&
    flatField.applicationId === flatObjectMetadata.applicationId;

  const remainingFlatFields = readableFlatFields
    .filter((flatField) => !priorityFlatFieldIds.has(flatField.id))
    .sort((firstFlatField, secondFlatField) => {
      const firstIsStandard = isStandardField(firstFlatField);
      const secondIsStandard = isStandardField(secondFlatField);

      if (firstIsStandard !== secondIsStandard) {
        return firstIsStandard ? -1 : 1;
      }

      return compareFieldNames(firstFlatField.name, secondFlatField.name);
    });

  return [...uniquePriorityFlatFields, ...remainingFlatFields];
};

export const computeFieldIdsToSelect = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  restrictedFields,
  requestedFieldNames,
  maximumDefaultFieldCount,
}: {
  flatObjectMetadata: FieldIdsToSelectFlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FieldIdsToSelectFlatFieldMetadata>;
  restrictedFields: RestrictedFieldsPermissions;
  requestedFieldNames?: string[];
  maximumDefaultFieldCount?: number;
}): FieldIdsToSelect => {
  const readableFlatFields = flatObjectMetadata.fieldIds
    .map((fieldId) =>
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: fieldId,
      }),
    )
    .filter((flatField) => restrictedFields[flatField.id]?.canRead !== false);

  if (isDefined(requestedFieldNames)) {
    const readableFlatFieldByName = new Map(
      readableFlatFields.map((flatField) => [flatField.name, flatField]),
    );

    const fieldIdsToSelect = new Set(
      ['id', ...requestedFieldNames]
        .map((fieldName) => readableFlatFieldByName.get(fieldName)?.id)
        .filter(isDefined),
    );

    return { fieldIdsToSelect, isDefaultFieldSetCapped: false };
  }

  if (
    !isDefined(maximumDefaultFieldCount) ||
    readableFlatFields.length <= maximumDefaultFieldCount
  ) {
    return { fieldIdsToSelect: undefined, isDefaultFieldSetCapped: false };
  }

  const cappedFlatFields = sortFlatFieldsByCappedFieldSetPriority({
    readableFlatFields,
    flatObjectMetadata,
  }).slice(0, maximumDefaultFieldCount);

  return {
    fieldIdsToSelect: new Set(
      cappedFlatFields.map((flatField) => flatField.id),
    ),
    isDefaultFieldSetCapped: true,
  };
};
