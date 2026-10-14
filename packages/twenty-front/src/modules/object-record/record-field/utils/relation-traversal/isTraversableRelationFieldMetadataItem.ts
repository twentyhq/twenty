import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { hasJunctionTargetFieldId } from '@/object-record/record-field/ui/utils/junction/hasJunctionTargetFieldId';

// A view field can traverse a plain many-to-one relation only: each row then
// reaches at most one related record, and a junction relation carries no
// scalar value of its own.
export const isTraversableRelationFieldMetadataItem = (
  fieldMetadataItem: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} =>
  isManyToOneRelationField(fieldMetadataItem) &&
  !hasJunctionTargetFieldId(fieldMetadataItem.settings);
