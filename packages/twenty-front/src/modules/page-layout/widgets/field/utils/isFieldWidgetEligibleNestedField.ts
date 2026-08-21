import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';

export const isFieldWidgetEligibleNestedField = (
  fieldMetadataItem: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} =>
  (fieldMetadataItem.isActive ?? false) &&
  isPlainOneToManyRelationField(fieldMetadataItem);
