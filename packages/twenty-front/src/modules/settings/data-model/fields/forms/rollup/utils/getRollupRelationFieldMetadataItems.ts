import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';

type RelationFieldMetadataItem = FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
};

export const getRollupRelationFieldMetadataItems = (
  fieldMetadataItems: FieldMetadataItem[],
): RelationFieldMetadataItem[] =>
  fieldMetadataItems.filter(
    (fieldMetadataItem): fieldMetadataItem is RelationFieldMetadataItem =>
      fieldMetadataItem.isActive === true &&
      isOneToManyRelationField(fieldMetadataItem),
  );
