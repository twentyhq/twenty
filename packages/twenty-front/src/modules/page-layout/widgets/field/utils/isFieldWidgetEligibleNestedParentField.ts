import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isPlainManyToOneRelationField } from '@/object-record/utils/isPlainManyToOneRelationField';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';

// A nested chain can start from either relation direction: a one-to-many
// first hop scopes the terminal view through a relation traversal filter,
// while a many-to-one first hop scopes it directly by the single related
// record the current record points at.
export const isFieldWidgetEligibleNestedParentField = (
  fieldMetadataItem: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} =>
  isPlainOneToManyRelationField(fieldMetadataItem) ||
  isPlainManyToOneRelationField(fieldMetadataItem);
