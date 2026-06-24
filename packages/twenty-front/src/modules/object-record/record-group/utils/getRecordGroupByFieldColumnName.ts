import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export const getRecordGroupByFieldColumnName = (
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'relation' | 'settings'
  >,
): string => {
  if (isManyToOneRelationField(fieldMetadataItem)) {
    return (
      fieldMetadataItem.settings?.joinColumnName ??
      computeRelationGqlFieldJoinColumnName({ name: fieldMetadataItem.name })
    );
  }

  return fieldMetadataItem.name;
};
