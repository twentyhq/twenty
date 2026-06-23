import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export const getRecordGroupByFieldColumnName = (
  field: Pick<FieldMetadataItem, 'type' | 'relation' | 'name' | 'settings'>,
): string => {
  if (!isManyToOneRelationField(field)) {
    return field.name;
  }

  return (
    field.settings?.joinColumnName ??
    computeRelationGqlFieldJoinColumnName({ name: field.name })
  );
};
