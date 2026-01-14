import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
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
        fieldMetadataItem.name !== 'deletedAt' &&
        (![
          FieldMetadataType.RELATION,
          FieldMetadataType.RICH_TEXT,
          FieldMetadataType.ACTOR,
        ].includes(fieldMetadataItem.type) ||
          fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );
};
