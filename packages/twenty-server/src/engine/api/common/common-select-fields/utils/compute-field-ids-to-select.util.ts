import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { isOneToManyRelationFlatField } from 'src/engine/api/common/common-select-fields/utils/is-one-to-many-relation-flat-field.util';
import { type Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
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
  | 'labelIdentifierFieldMetadataId'
  | 'imageIdentifierFieldMetadataId'
  | 'applicationId'
  | 'applicationUniversalIdentifier'
>;

type FieldIdsToSelectFlatFieldMetadata = Pick<
  OrmFlatFieldMetadata,
  'id' | 'applicationId' | 'name' | 'type' | 'settings'
>;

const compareFieldNames = (
  firstFieldName: string,
  secondFieldName: string,
): number => {
  if (firstFieldName < secondFieldName) {
    return -1;
  }

  if (firstFieldName > secondFieldName) {
    return 1;
  }

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
  readableFlatFields,
  depth,
  requestedFieldNames,
  maximumDefaultFieldCount,
}: {
  flatObjectMetadata: FieldIdsToSelectFlatObjectMetadata;
  readableFlatFields: FieldIdsToSelectFlatFieldMetadata[];
  depth: Depth | undefined;
  requestedFieldNames?: string[];
  maximumDefaultFieldCount?: number;
}): Set<string> | undefined => {
  if (isDefined(requestedFieldNames)) {
    const readableFlatFieldByName = new Map(
      readableFlatFields.map((flatField) => [flatField.name, flatField]),
    );

    return new Set(
      ['id', ...requestedFieldNames]
        .map((fieldName) => readableFlatFieldByName.get(fieldName)?.id)
        .filter(isDefined),
    );
  }

  const isRelationExpansionDisabled = !isDefined(depth) || depth === 0;

  const outputtingFlatFields = isRelationExpansionDisabled
    ? readableFlatFields.filter(
        (flatField) => !isOneToManyRelationFlatField(flatField),
      )
    : readableFlatFields;

  if (
    !isDefined(maximumDefaultFieldCount) ||
    outputtingFlatFields.length <= maximumDefaultFieldCount
  ) {
    return undefined;
  }

  const cappedFlatFields = sortFlatFieldsByCappedFieldSetPriority({
    readableFlatFields: outputtingFlatFields,
    flatObjectMetadata,
  }).slice(0, maximumDefaultFieldCount);

  return new Set(cappedFlatFields.map((flatField) => flatField.id));
};
