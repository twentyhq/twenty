import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type TimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useFindManyTimelineActivityRules';
import { junctionRelationReachesObject } from '@/settings/data-model/timeline-rules/utils/junctionRelationReachesObject';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export type SettingsTimelineRuleRow = {
  // null for the participant listener entries, which are not rules yet
  timelineActivityRule: TimelineActivityRule | null;
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  viaFieldMetadataItem: FieldMetadataItem | null;
  actions: string[];
  triggerFieldMetadataItems: FieldMetadataItem[];
  isConfigurable: boolean;
};

// The message and calendar event listeners write linked entries onto person
// timelines from participant matching, outside of any relation.
const PARTICIPANT_RULE_SOURCE_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.message.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
];

type GetSettingsTimelineRuleRowsArgs = {
  timelineActivityRules: TimelineActivityRule[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

export const getSettingsTimelineRuleRows = ({
  timelineActivityRules,
  objectMetadataItem,
  objectMetadataItems,
}: GetSettingsTimelineRuleRowsArgs): SettingsTimelineRuleRow[] => {
  const relationRuleRows = timelineActivityRules.flatMap(
    (timelineActivityRule) => {
      if (!isDefined(timelineActivityRule.relationFieldMetadataId)) {
        return [];
      }

      const sourceObjectMetadataItem = objectMetadataItems.find(
        (item) => item.id === timelineActivityRule.objectMetadataId,
      );

      if (!isDefined(sourceObjectMetadataItem)) {
        return [];
      }

      const viaFieldMetadataItem = sourceObjectMetadataItem.fields.find(
        (field) => field.id === timelineActivityRule.relationFieldMetadataId,
      );

      if (
        !isDefined(viaFieldMetadataItem) ||
        !junctionRelationReachesObject({
          relationFieldMetadataItem: viaFieldMetadataItem,
          objectMetadataItem,
          objectMetadataItems,
        })
      ) {
        return [];
      }

      const triggerFieldMetadataItems = (
        timelineActivityRule.triggerFieldMetadataIds ?? []
      )
        .map((triggerFieldMetadataId) =>
          sourceObjectMetadataItem.fields.find(
            (field) => field.id === triggerFieldMetadataId,
          ),
        )
        .filter(isDefined);

      return [
        {
          timelineActivityRule,
          sourceObjectMetadataItem,
          viaFieldMetadataItem,
          actions: timelineActivityRule.actions,
          triggerFieldMetadataItems,
          isConfigurable: true,
        },
      ];
    },
  );

  const participantRuleRows =
    objectMetadataItem.universalIdentifier ===
    STANDARD_OBJECTS.person.universalIdentifier
      ? PARTICIPANT_RULE_SOURCE_UNIVERSAL_IDENTIFIERS.flatMap(
          (sourceUniversalIdentifier) => {
            const sourceObjectMetadataItem = objectMetadataItems.find(
              (item) => item.universalIdentifier === sourceUniversalIdentifier,
            );

            if (!isDefined(sourceObjectMetadataItem)) {
              return [];
            }

            return [
              {
                timelineActivityRule: null,
                sourceObjectMetadataItem,
                viaFieldMetadataItem: null,
                actions: ['linked'],
                triggerFieldMetadataItems: [],
                isConfigurable: false,
              },
            ];
          },
        )
      : [];

  return [...relationRuleRows, ...participantRuleRows];
};
