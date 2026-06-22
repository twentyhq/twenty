import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationToWorkspaceMember } from '@/object-metadata/utils/isManyToOneRelationToWorkspaceMember';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export const getRecordGroupByFieldColumnName = (
  field: Pick<FieldMetadataItem, 'type' | 'relation' | 'name' | 'settings'>,
): string => {
  if (!isManyToOneRelationToWorkspaceMember(field)) {
    return field.name;
  }

  return (
    field.settings?.joinColumnName ??
    computeRelationGqlFieldJoinColumnName({ name: field.name })
  );
};
