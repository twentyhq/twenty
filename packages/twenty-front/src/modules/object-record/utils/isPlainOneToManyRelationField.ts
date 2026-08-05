import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';

// Junction relation fields also carry ONE_TO_MANY metadata but render through
// a dedicated junction path, mirroring the backend's
// isPlainOneToManyRelationFlatFieldMetadata.
export const isPlainOneToManyRelationField = (
  fieldMetadataItem: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} =>
  isOneToManyRelationField(fieldMetadataItem) &&
  !hasJunctionConfig(fieldMetadataItem.settings);
