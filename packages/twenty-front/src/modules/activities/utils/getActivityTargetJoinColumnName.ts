import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Resolve the join column from the actual relation field metadata on
// noteTarget/taskTarget so it stays correct after a target object is renamed.
// The derived target<Name>Id no longer matches the frozen join column once
// the object name changes.
export const getActivityTargetJoinColumnName = ({
  activityTargetObjectMetadataItem,
  targetObjectNameSingular,
}: {
  activityTargetObjectMetadataItem: EnrichedObjectMetadataItem;
  targetObjectNameSingular: string;
}): string => {
  const relationField = activityTargetObjectMetadataItem.fields.find(
    (field) => {
      if (
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(field.morphRelations)
      ) {
        return field.morphRelations.some(
          (morphRelation) =>
            morphRelation.targetObjectMetadata.nameSingular ===
            targetObjectNameSingular,
        );
      }

      return (
        field.relation?.targetObjectMetadata.nameSingular ===
        targetObjectNameSingular
      );
    },
  );

  const joinColumnName = (
    relationField?.settings as FieldRelationMetadataSettings
  )?.joinColumnName;

  return (
    joinColumnName ??
    getActivityTargetObjectFieldIdName({
      nameSingular: targetObjectNameSingular,
    })
  );
};
