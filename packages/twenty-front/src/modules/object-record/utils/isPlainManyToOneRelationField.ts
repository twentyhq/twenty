import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';

// Junction relation fields also carry MANY_TO_ONE metadata but render through
// a dedicated junction path, mirroring isPlainOneToManyRelationField.
export const isPlainManyToOneRelationField = (
  fieldMetadataItem: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} =>
  isManyToOneRelationField(fieldMetadataItem) &&
  !isJunctionRelationField(fieldMetadataItem);
