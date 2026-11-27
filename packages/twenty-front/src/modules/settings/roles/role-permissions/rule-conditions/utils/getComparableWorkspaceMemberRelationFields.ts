/* @license Enterprise */

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const getComparableWorkspaceMemberRelationFields = ({
  workspaceMemberFieldMetadataItems,
  targetObjectMetadataId,
}: {
  workspaceMemberFieldMetadataItems: FieldMetadataItem[];
  targetObjectMetadataId: string | undefined;
}): FieldMetadataItem[] => {
  if (!isDefined(targetObjectMetadataId)) {
    return [];
  }

  return workspaceMemberFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.RELATION &&
      fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
      fieldMetadataItem.relation.targetObjectMetadata.id ===
        targetObjectMetadataId,
  );
};
