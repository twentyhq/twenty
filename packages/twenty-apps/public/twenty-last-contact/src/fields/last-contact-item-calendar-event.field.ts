import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  LAST_CONTACT_FOR_PEOPLE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  LAST_CONTACT_ITEM_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  LAST_CONTACT_ITEM_MORPH_ID,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    LAST_CONTACT_ITEM_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.MORPH_RELATION,
  name: 'lastContactItemCalendarEvent',
  label: 'Last contact item',
  description: 'The email or meeting that was the most recent contact.',
  icon: 'IconCalendarEvent',
  isNullable: true,
  morphId: LAST_CONTACT_ITEM_MORPH_ID,
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    LAST_CONTACT_FOR_PEOPLE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'lastContactItemCalendarEventId',
  },
  isUIEditable: false,
});
