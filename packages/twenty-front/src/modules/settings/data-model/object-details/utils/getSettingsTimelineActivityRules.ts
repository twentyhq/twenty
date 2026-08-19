import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { hasJunctionTargetFieldId } from '@/object-record/record-field/ui/utils/junction/hasJunctionTargetFieldId';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type SettingsTimelineActivityRuleAction =
  | 'linked'
  | 'unlinked'
  | 'updated';

export type SettingsTimelineActivityRule = {
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  viaFieldMetadataItem: FieldMetadataItem | null;
  actions: SettingsTimelineActivityRuleAction[];
  triggerFieldMetadataItems: FieldMetadataItem[];
  isConfigurable: boolean;
};

// Mirrors STANDARD_TIMELINE_ACTIVITY_RULES on the server: fan-out is declared
// on note and task instead of derived from every junction relation, so that a
// new junction does not silently start writing timeline entries.
const STANDARD_RULE_SOURCES = [
  {
    objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
    relationFieldUniversalIdentifier:
      STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
    triggerFieldUniversalIdentifiers: [
      STANDARD_OBJECTS.note.fields.title.universalIdentifier,
    ],
  },
  {
    objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
    relationFieldUniversalIdentifier:
      STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
    triggerFieldUniversalIdentifiers: [
      STANDARD_OBJECTS.task.fields.title.universalIdentifier,
    ],
  },
];

// The message and calendar event listeners write linked entries onto person
// timelines from participant matching, outside of any relation.
const PARTICIPANT_RULE_SOURCE_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.message.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
];

type GetSettingsTimelineActivityRulesArgs = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

// A morph group is served as a single field carrying one member's id, so the
// settings id can point at a member the store does not list. Fall back to the
// junction object's morph field when the exact id is absent.
const findJunctionTargetFieldMetadataItem = ({
  junctionObjectMetadataItem,
  junctionTargetFieldId,
  sourceFieldMetadataId,
}: {
  junctionObjectMetadataItem: EnrichedObjectMetadataItem;
  junctionTargetFieldId: string;
  sourceFieldMetadataId: string | undefined;
}): FieldMetadataItem | undefined => {
  const exactFieldMetadataItem = junctionObjectMetadataItem.fields.find(
    (field) => field.id === junctionTargetFieldId,
  );

  if (isDefined(exactFieldMetadataItem)) {
    return exactFieldMetadataItem;
  }

  const morphFieldMetadataItems = junctionObjectMetadataItem.fields.filter(
    (field) =>
      field.type === FieldMetadataType.MORPH_RELATION &&
      field.id !== sourceFieldMetadataId,
  );

  return morphFieldMetadataItems.length === 1
    ? morphFieldMetadataItems[0]
    : undefined;
};

const junctionRuleReachesObject = ({
  relationFieldMetadataItem,
  objectMetadataItem,
  objectMetadataItems,
}: {
  relationFieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): boolean => {
  const relationTargetObjectMetadataId =
    relationFieldMetadataItem.relation?.targetObjectMetadata.id;
  const settings = relationFieldMetadataItem.settings;

  if (
    !isDefined(relationTargetObjectMetadataId) ||
    !hasJunctionTargetFieldId(settings)
  ) {
    return false;
  }

  const junctionObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === relationTargetObjectMetadataId,
  );

  if (!isDefined(junctionObjectMetadataItem)) {
    return false;
  }

  const junctionTargetFieldMetadataItem = findJunctionTargetFieldMetadataItem({
    junctionObjectMetadataItem,
    junctionTargetFieldId: settings.junctionTargetFieldId,
    sourceFieldMetadataId:
      relationFieldMetadataItem.relation?.targetFieldMetadata?.id,
  });

  if (!isDefined(junctionTargetFieldMetadataItem)) {
    return false;
  }

  return junctionTargetFieldMetadataItem.type ===
    FieldMetadataType.MORPH_RELATION
    ? (junctionTargetFieldMetadataItem.morphRelations ?? []).some(
        (morphRelation) =>
          morphRelation.targetObjectMetadata.id === objectMetadataItem.id,
      )
    : junctionTargetFieldMetadataItem.relation?.targetObjectMetadata.id ===
        objectMetadataItem.id;
};

export const getSettingsTimelineActivityRules = ({
  objectMetadataItem,
  objectMetadataItems,
}: GetSettingsTimelineActivityRulesArgs): SettingsTimelineActivityRule[] => {
  const junctionRules = STANDARD_RULE_SOURCES.flatMap((ruleSource) => {
    const sourceObjectMetadataItem = objectMetadataItems.find(
      (item) =>
        item.universalIdentifier === ruleSource.objectUniversalIdentifier,
    );

    if (!isDefined(sourceObjectMetadataItem)) {
      return [];
    }

    const relationFieldMetadataItem = sourceObjectMetadataItem.fields.find(
      (field) =>
        field.universalIdentifier ===
        ruleSource.relationFieldUniversalIdentifier,
    );

    if (!isDefined(relationFieldMetadataItem)) {
      return [];
    }

    if (
      !junctionRuleReachesObject({
        relationFieldMetadataItem,
        objectMetadataItem,
        objectMetadataItems,
      })
    ) {
      return [];
    }

    const triggerFieldMetadataItems =
      ruleSource.triggerFieldUniversalIdentifiers
        .map((triggerFieldUniversalIdentifier) =>
          sourceObjectMetadataItem.fields.find(
            (field) =>
              field.universalIdentifier === triggerFieldUniversalIdentifier,
          ),
        )
        .filter(isDefined);

    return [
      {
        sourceObjectMetadataItem,
        viaFieldMetadataItem: relationFieldMetadataItem,
        actions: [
          'linked',
          'unlinked',
          'updated',
        ] as SettingsTimelineActivityRuleAction[],
        triggerFieldMetadataItems,
        isConfigurable: true,
      },
    ];
  });

  const participantRules =
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
                sourceObjectMetadataItem,
                viaFieldMetadataItem: null,
                actions: ['linked'] as SettingsTimelineActivityRuleAction[],
                triggerFieldMetadataItems: [],
                isConfigurable: false,
              },
            ];
          },
        )
      : [];

  return [...junctionRules, ...participantRules];
};
