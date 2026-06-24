import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export const getRecordGroupByFieldColumnName = (
  field: Pick<FieldMetadataItem, 'type' | 'relation' | 'name'>,
): string => {
  if (!isManyToOneRelationField(field)) {
    return field.name;
  }

  return computeRelationGqlFieldJoinColumnName({ name: field.name });
};
