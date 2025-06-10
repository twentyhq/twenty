import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

export const filterAvailableFieldMetadataItemsToImport = (
  fields: FieldMetadataItem[],
) => {
  return fields
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.isActive &&
        (!fieldMetadataItem.isSystem || fieldMetadataItem.name === 'id') &&
        fieldMetadataItem.name !== 'createdAt' &&
        fieldMetadataItem.name !== 'updatedAt' &&
        fieldMetadataItem.type !== FieldMetadataType.ACTOR &&
        (fieldMetadataItem.type !== FieldMetadataType.RELATION ||
          fieldMetadataItem.relationDefinition?.direction ===
            RelationDefinitionType.MANY_TO_ONE),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );
};
