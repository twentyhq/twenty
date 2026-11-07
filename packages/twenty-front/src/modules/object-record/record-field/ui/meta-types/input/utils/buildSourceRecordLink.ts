import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export const buildSourceRecordLink = ({
  relationFieldMetadataItem,
  sourceObjectMetadataId,
  sourceRecordId,
}: {
  relationFieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'settings'
  >;
  sourceObjectMetadataId: string;
  sourceRecordId: string;
}): Partial<ObjectRecord> => {
  if (
    relationFieldMetadataItem.settings?.relationType !==
    RelationType.MANY_TO_ONE
  ) {
    return {};
  }

  if (relationFieldMetadataItem.type === FieldMetadataType.MORPH_RELATION) {
    return {
      [relationFieldMetadataItem.name]: {
        targetObjectMetadataId: sourceObjectMetadataId,
        id: sourceRecordId,
      },
    };
  }

  return {
    [computeRelationGqlFieldJoinColumnName({
      name: relationFieldMetadataItem.name,
    })]: sourceRecordId,
  };
};
