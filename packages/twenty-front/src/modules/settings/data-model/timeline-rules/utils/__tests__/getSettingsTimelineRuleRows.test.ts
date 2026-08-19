import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type TimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useFindManyTimelineActivityRules';
import { getSettingsTimelineRuleCandidateRelations } from '@/settings/data-model/timeline-rules/utils/getSettingsTimelineRuleCandidateRelations';
import { getSettingsTimelineRuleRows } from '@/settings/data-model/timeline-rules/utils/getSettingsTimelineRuleRows';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const COMPANY_OBJECT_ID = 'company-object-id';
const PERSON_OBJECT_ID = 'person-object-id';
const NOTE_OBJECT_ID = 'note-object-id';
const NOTE_TARGET_OBJECT_ID = 'note-target-object-id';
const NOTE_TARGETS_FIELD_ID = 'note-note-targets-field-id';
const NOTE_TITLE_FIELD_ID = 'note-title-field-id';

const buildObjectMetadataItem = (
  overrides: Partial<EnrichedObjectMetadataItem>,
): EnrichedObjectMetadataItem =>
  ({
    id: 'object-id',
    universalIdentifier: 'object-universal-identifier',
    nameSingular: 'object',
    namePlural: 'objects',
    labelSingular: 'Object',
    labelPlural: 'Objects',
    isSystem: false,
    isRemote: false,
    isActive: true,
    fields: [],
    ...overrides,
  }) as unknown as EnrichedObjectMetadataItem;

const companyObjectMetadataItem = buildObjectMetadataItem({
  id: COMPANY_OBJECT_ID,
  universalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
  nameSingular: 'company',
  labelPlural: 'Companies',
});

const personObjectMetadataItem = buildObjectMetadataItem({
  id: PERSON_OBJECT_ID,
  universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
  nameSingular: 'person',
  labelPlural: 'People',
});

const noteTargetObjectMetadataItem = buildObjectMetadataItem({
  id: NOTE_TARGET_OBJECT_ID,
  universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
  nameSingular: 'noteTarget',
  fields: [
    {
      id: 'note-target-target-person-field-id',
      name: 'targetPerson',
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        {
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadata: { id: PERSON_OBJECT_ID },
        },
        {
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadata: { id: COMPANY_OBJECT_ID },
        },
      ],
    },
  ] as unknown as EnrichedObjectMetadataItem['fields'],
});

const noteObjectMetadataItem = buildObjectMetadataItem({
  id: NOTE_OBJECT_ID,
  universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
  nameSingular: 'note',
  labelPlural: 'Notes',
  fields: [
    {
      id: NOTE_TITLE_FIELD_ID,
      name: 'title',
      label: 'Title',
      type: FieldMetadataType.TEXT,
    },
    {
      id: NOTE_TARGETS_FIELD_ID,
      name: 'noteTargets',
      label: 'Relations',
      type: FieldMetadataType.RELATION,
      relation: {
        type: RelationType.ONE_TO_MANY,
        targetObjectMetadata: { id: NOTE_TARGET_OBJECT_ID },
      },
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldId: 'note-target-target-person-field-id',
      },
    },
  ] as unknown as EnrichedObjectMetadataItem['fields'],
});

const objectMetadataItems = [
  companyObjectMetadataItem,
  personObjectMetadataItem,
  noteObjectMetadataItem,
  noteTargetObjectMetadataItem,
];

const noteTimelineActivityRule: TimelineActivityRule = {
  __typename: 'TimelineActivityRule',
  id: 'note-rule-id',
  objectMetadataId: NOTE_OBJECT_ID,
  relationFieldMetadataId: NOTE_TARGETS_FIELD_ID,
  resolution: 'MATERIALIZED',
  actions: ['updated', 'linked', 'unlinked'],
  triggerFieldMetadataIds: [NOTE_TITLE_FIELD_ID],
  isActive: true,
  isStandard: true,
  isOverridden: false,
};

describe('getSettingsTimelineRuleRows', () => {
  it('should build a row for a rule whose junction reaches the object', () => {
    const rows = getSettingsTimelineRuleRows({
      timelineActivityRules: [noteTimelineActivityRule],
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].sourceObjectMetadataItem.nameSingular).toBe('note');
    expect(rows[0].viaFieldMetadataItem?.name).toBe('noteTargets');
    expect(
      rows[0].triggerFieldMetadataItems.map((field) => field.name),
    ).toEqual(['title']);
    expect(rows[0].isConfigurable).toBe(true);
  });

  it('should not build a row for an object the junction does not reach', () => {
    const shipmentObjectMetadataItem = buildObjectMetadataItem({
      id: 'shipment-object-id',
      universalIdentifier: 'shipment-universal-identifier',
      nameSingular: 'shipment',
    });

    const rows = getSettingsTimelineRuleRows({
      timelineActivityRules: [noteTimelineActivityRule],
      objectMetadataItem: shipmentObjectMetadataItem,
      objectMetadataItems: [...objectMetadataItems, shipmentObjectMetadataItem],
    });

    expect(rows).toHaveLength(0);
  });

  it('should exclude self rules from the rows', () => {
    const selfRule: TimelineActivityRule = {
      __typename: 'TimelineActivityRule',
      id: null,
      objectMetadataId: COMPANY_OBJECT_ID,
      relationFieldMetadataId: null,
      resolution: 'MATERIALIZED',
      actions: ['created', 'updated', 'deleted', 'restored'],
      triggerFieldMetadataIds: null,
      isActive: true,
      isStandard: true,
      isOverridden: false,
    };

    const rows = getSettingsTimelineRuleRows({
      timelineActivityRules: [selfRule],
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems,
    });

    expect(rows).toHaveLength(0);
  });

  it('should add the non configurable participant rows on person only', () => {
    const messageObjectMetadataItem = buildObjectMetadataItem({
      id: 'message-object-id',
      universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
      nameSingular: 'message',
      labelPlural: 'Messages',
    });
    const calendarEventObjectMetadataItem = buildObjectMetadataItem({
      id: 'calendar-event-object-id',
      universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      nameSingular: 'calendarEvent',
      labelPlural: 'Calendar events',
    });

    const rows = getSettingsTimelineRuleRows({
      timelineActivityRules: [],
      objectMetadataItem: personObjectMetadataItem,
      objectMetadataItems: [
        ...objectMetadataItems,
        messageObjectMetadataItem,
        calendarEventObjectMetadataItem,
      ],
    });

    expect(
      rows.map((row) => row.sourceObjectMetadataItem.nameSingular),
    ).toEqual(['message', 'calendarEvent']);
    expect(rows.every((row) => !row.isConfigurable)).toBe(true);
    expect(rows.every((row) => row.timelineActivityRule === null)).toBe(true);
  });
});

describe('getSettingsTimelineRuleCandidateRelations', () => {
  it('should offer a reaching junction relation that has no rule yet', () => {
    const candidates = getSettingsTimelineRuleCandidateRelations({
      timelineActivityRules: [],
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems,
    });

    expect(candidates).toHaveLength(1);
    expect(candidates[0].sourceObjectMetadataItem.nameSingular).toBe('note');
    expect(candidates[0].relationFieldMetadataItem.name).toBe('noteTargets');
  });

  it('should not offer a relation that already has a rule', () => {
    const candidates = getSettingsTimelineRuleCandidateRelations({
      timelineActivityRules: [noteTimelineActivityRule],
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems,
    });

    expect(candidates).toHaveLength(0);
  });
});
