import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getSettingsTimelineActivityRules } from '@/settings/data-model/object-details/utils/getSettingsTimelineActivityRules';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const COMPANY_OBJECT_ID = 'company-object-id';
const PERSON_OBJECT_ID = 'person-object-id';
const NOTE_OBJECT_ID = 'note-object-id';
const NOTE_TARGET_OBJECT_ID = 'note-target-object-id';

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
      universalIdentifier:
        STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
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
      id: 'note-title-field-id',
      universalIdentifier:
        STANDARD_OBJECTS.note.fields.title.universalIdentifier,
      name: 'title',
      label: 'Title',
      type: FieldMetadataType.TEXT,
    },
    {
      id: 'note-note-targets-field-id',
      universalIdentifier:
        STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
      name: 'noteTargets',
      label: 'Note targets',
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

describe('getSettingsTimelineActivityRules', () => {
  it('should derive the note junction rule for an object the morph target reaches', () => {
    const rules = getSettingsTimelineActivityRules({
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems,
    });

    expect(rules).toHaveLength(1);
    expect(rules[0].sourceObjectMetadataItem.nameSingular).toBe('note');
    expect(rules[0].viaFieldMetadataItem?.name).toBe('noteTargets');
    expect(rules[0].actions).toEqual(['linked', 'unlinked', 'updated']);
    expect(
      rules[0].triggerFieldMetadataItems.map((field) => field.name),
    ).toEqual(['title']);
    expect(rules[0].isConfigurable).toBe(true);
  });

  it('should not derive a junction rule for an object the junction does not reach', () => {
    const shipmentObjectMetadataItem = buildObjectMetadataItem({
      id: 'shipment-object-id',
      universalIdentifier: 'shipment-universal-identifier',
      nameSingular: 'shipment',
    });

    const rules = getSettingsTimelineActivityRules({
      objectMetadataItem: shipmentObjectMetadataItem,
      objectMetadataItems: [...objectMetadataItems, shipmentObjectMetadataItem],
    });

    expect(rules).toHaveLength(0);
  });

  it('should not derive a junction rule when the relation declares no junction target', () => {
    const noteWithoutJunction = {
      ...noteObjectMetadataItem,
      fields: noteObjectMetadataItem.fields.map((field) =>
        field.name === 'noteTargets'
          ? { ...field, settings: { relationType: RelationType.ONE_TO_MANY } }
          : field,
      ),
    } as EnrichedObjectMetadataItem;

    const rules = getSettingsTimelineActivityRules({
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems: [
        companyObjectMetadataItem,
        personObjectMetadataItem,
        noteWithoutJunction,
        noteTargetObjectMetadataItem,
      ],
    });

    expect(rules).toHaveLength(0);
  });

  it('should resolve the junction target through the morph group when the settings id points at an unlisted morph member', () => {
    const noteWithUnlistedMemberId = {
      ...noteObjectMetadataItem,
      fields: noteObjectMetadataItem.fields.map((field) =>
        field.name === 'noteTargets'
          ? {
              ...field,
              settings: {
                relationType: RelationType.ONE_TO_MANY,
                junctionTargetFieldId: 'unlisted-morph-member-id',
              },
            }
          : field,
      ),
    } as EnrichedObjectMetadataItem;

    const rules = getSettingsTimelineActivityRules({
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems: [
        companyObjectMetadataItem,
        personObjectMetadataItem,
        noteWithUnlistedMemberId,
        noteTargetObjectMetadataItem,
      ],
    });

    expect(rules).toHaveLength(1);
    expect(rules[0].sourceObjectMetadataItem.nameSingular).toBe('note');
  });

  it('should add the non configurable participant rules on person only', () => {
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

    const rules = getSettingsTimelineActivityRules({
      objectMetadataItem: personObjectMetadataItem,
      objectMetadataItems: [
        ...objectMetadataItems,
        messageObjectMetadataItem,
        calendarEventObjectMetadataItem,
      ],
    });

    const participantRules = rules.filter((rule) => !rule.isConfigurable);

    expect(
      participantRules.map(
        (rule) => rule.sourceObjectMetadataItem.nameSingular,
      ),
    ).toEqual(['message', 'calendarEvent']);
    expect(
      participantRules.every((rule) => rule.viaFieldMetadataItem === null),
    ).toBe(true);
    expect(participantRules.every((rule) => rule.actions.length === 1)).toBe(
      true,
    );
  });
});
