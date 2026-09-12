import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getFieldRelations = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'relation' | 'morphRelations'>,
) => [
  ...(isDefined(fieldMetadataItem.relation)
    ? [fieldMetadataItem.relation]
    : []),
  ...(fieldMetadataItem.morphRelations ?? []),
];
