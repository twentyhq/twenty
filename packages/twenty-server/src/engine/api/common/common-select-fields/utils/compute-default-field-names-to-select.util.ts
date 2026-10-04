import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeDefaultFieldNamesToSelect = ({
  flatObjectMetadata,
  readableFlatFields,
  maximumDefaultFieldCount,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    | 'labelIdentifierFieldMetadataId'
    | 'imageIdentifierFieldMetadataId'
    | 'applicationId'
    | 'applicationUniversalIdentifier'
  >;
  readableFlatFields: Pick<
    OrmFlatFieldMetadata,
    'id' | 'applicationId' | 'name'
  >[];
  maximumDefaultFieldCount?: number;
}): ReadonlySet<string> => {
  const fieldNames = new Set(readableFlatFields.map((field) => field.name));

  if (
    !isDefined(maximumDefaultFieldCount) ||
    readableFlatFields.length <= maximumDefaultFieldCount
  ) {
    return fieldNames;
  }

  const priorityFieldNames = [
    'id',
    readableFlatFields.find(
      (flatField) =>
        flatField.id === flatObjectMetadata.labelIdentifierFieldMetadataId,
    )?.name,
    readableFlatFields.find(
      (flatField) =>
        flatField.id === flatObjectMetadata.imageIdentifierFieldMetadataId,
    )?.name,
    'createdAt',
    'updatedAt',
    'deletedAt',
    'position',
  ].filter(isDefined);

  const isStandardObject =
    flatObjectMetadata.applicationUniversalIdentifier ===
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

  const alphabeticFieldNames = [...fieldNames].sort();
  const standardFieldNames = new Set(
    readableFlatFields
      .filter(
        (field) =>
          isStandardObject &&
          field.applicationId === flatObjectMetadata.applicationId,
      )
      .map((field) => field.name),
  );
  const orderedFieldNames = new Set([
    ...priorityFieldNames,
    ...alphabeticFieldNames.filter((name) => standardFieldNames.has(name)),
    ...alphabeticFieldNames,
  ]);

  return new Set(
    [...orderedFieldNames]
      .filter((name) => fieldNames.has(name))
      .slice(0, maximumDefaultFieldCount),
  );
};
