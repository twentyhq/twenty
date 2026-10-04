import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { isOneToManyRelationFlatField } from 'src/engine/api/common/metadata-selection/utils/is-one-to-many-relation-flat-field.util';
import { type SelectionDepth } from 'src/engine/api/common/metadata-selection/types/selection-depth.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeDefaultFieldNamesToSelect = ({
  flatObjectMetadata,
  readableFlatFields,
  depth,
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
    'id' | 'applicationId' | 'name' | 'type' | 'settings'
  >[];
  depth: SelectionDepth | undefined;
  maximumDefaultFieldCount: number;
}): ReadonlySet<string> | undefined => {
  const outputtingFlatFields =
    !isDefined(depth) || depth === 0
      ? readableFlatFields.filter(
          (flatField) => !isOneToManyRelationFlatField(flatField),
        )
      : readableFlatFields;

  if (outputtingFlatFields.length <= maximumDefaultFieldCount) {
    return undefined;
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

  const getFieldPriority = (flatField: (typeof readableFlatFields)[number]) => {
    const priorityIndex = priorityFieldNames.indexOf(flatField.name);

    if (priorityIndex !== -1) {
      return priorityIndex;
    }

    const isStandardField =
      isStandardObject &&
      flatField.applicationId === flatObjectMetadata.applicationId;

    return priorityFieldNames.length + (isStandardField ? 0 : 1);
  };

  const sortedFlatFields = [...outputtingFlatFields].sort(
    (firstField, secondField) => {
      const priorityDifference =
        getFieldPriority(firstField) - getFieldPriority(secondField);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      if (firstField.name < secondField.name) {
        return -1;
      }

      return firstField.name > secondField.name ? 1 : 0;
    },
  );

  return new Set(
    sortedFlatFields
      .slice(0, maximumDefaultFieldCount)
      .map((flatField) => flatField.name),
  );
};
