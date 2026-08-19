import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type TimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useFindManyTimelineActivityRules';
import { junctionRelationReachesObject } from '@/settings/data-model/timeline-rules/utils/junctionRelationReachesObject';
import { isDefined } from 'twenty-shared/utils';

export type SettingsTimelineRuleCandidateRelation = {
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  relationFieldMetadataItem: FieldMetadataItem;
};

type GetSettingsTimelineRuleCandidateRelationsArgs = {
  timelineActivityRules: TimelineActivityRule[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

// Junction relations whose target morph reaches this object and that no rule
// walks yet. The write engine only fans out along junctions, so these are the
// only relations a new emission rule can be created on.
export const getSettingsTimelineRuleCandidateRelations = ({
  timelineActivityRules,
  objectMetadataItem,
  objectMetadataItems,
}: GetSettingsTimelineRuleCandidateRelationsArgs): SettingsTimelineRuleCandidateRelation[] => {
  const ruledRelationFieldMetadataIds = new Set(
    timelineActivityRules
      .map((rule) => rule.relationFieldMetadataId)
      .filter(isDefined),
  );

  return objectMetadataItems.flatMap((sourceObjectMetadataItem) => {
    if (
      sourceObjectMetadataItem.isSystem ||
      sourceObjectMetadataItem.isRemote ||
      !sourceObjectMetadataItem.isActive
    ) {
      return [];
    }

    return sourceObjectMetadataItem.fields
      .filter(
        (field) =>
          !ruledRelationFieldMetadataIds.has(field.id) &&
          junctionRelationReachesObject({
            relationFieldMetadataItem: field,
            objectMetadataItem,
            objectMetadataItems,
          }),
      )
      .map((relationFieldMetadataItem) => ({
        sourceObjectMetadataItem,
        relationFieldMetadataItem,
      }));
  });
};
