import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type TimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useFindManyTimelineActivityRules';
import { relationRuleReachesObject } from '@/settings/data-model/timeline-rules/utils/relationRuleReachesObject';
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

// Relations a new emission rule can be created on: junction relations whose
// target morph reaches this object, and many-to-one lookups on other objects
// pointing at it, when no rule walks them yet.
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
          field.isActive !== false &&
          field.isSystem !== true &&
          relationRuleReachesObject({
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
