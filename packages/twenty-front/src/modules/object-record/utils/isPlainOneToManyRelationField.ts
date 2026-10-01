import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { isConfiguredJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isConfiguredJunctionRelationField';

// Junction relation fields also carry ONE_TO_MANY metadata; mirrors isPlainOneToManyRelationFlatFieldMetadata.
export const isPlainOneToManyRelationField = (
  fieldMetadataItem: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} =>
  isOneToManyRelationField(fieldMetadataItem) &&
  !isConfiguredJunctionRelationField(fieldMetadataItem);
