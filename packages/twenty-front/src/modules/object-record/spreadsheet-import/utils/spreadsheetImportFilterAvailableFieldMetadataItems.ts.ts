import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

export const spreadsheetImportFilterAvailableFieldMetadataItems = (
  fields: FieldMetadataItem[],
) => {
  return fields
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.isActive &&
        (!fieldMetadataItem.isSystem || fieldMetadataItem.name === 'id') &&
        fieldMetadataItem.name !== 'createdAt' &&
        fieldMetadataItem.name !== 'updatedAt' &&
        (![FieldMetadataType.RELATION, FieldMetadataType.RICH_TEXT].includes(
          fieldMetadataItem.type,
        ) ||
          fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );
};
