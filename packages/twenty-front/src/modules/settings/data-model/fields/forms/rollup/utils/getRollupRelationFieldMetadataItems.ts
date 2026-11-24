import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

export const getRollupRelationFieldMetadataItems = (
  fieldMetadataItems: FieldMetadataItem[],
): FieldMetadataItem[] =>
  fieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive === true &&
      fieldMetadataItem.type === FieldMetadataType.RELATION &&
      fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY,
  );
