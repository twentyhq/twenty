import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isPlainManyToOneRelationField } from '@/object-record/utils/isPlainManyToOneRelationField';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';

// Either first-hop direction works: one-to-many through a traversal filter, many-to-one directly.
export const isFieldWidgetEligibleNestedParentField = (
  fieldMetadataItem: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} =>
  isPlainOneToManyRelationField(fieldMetadataItem) ||
  isPlainManyToOneRelationField(fieldMetadataItem);
