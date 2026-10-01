import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isConfiguredJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isConfiguredJunctionRelationField';

// Junction relation fields also carry MANY_TO_ONE metadata but render through a junction path.
export const isPlainManyToOneRelationField = (
  fieldMetadataItem: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} =>
  isManyToOneRelationField(fieldMetadataItem) &&
  !isConfiguredJunctionRelationField(fieldMetadataItem);
