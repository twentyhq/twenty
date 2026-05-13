// salesNote → calendarEvent (MANY_TO_ONE)
import {
  CALENDAR_EVENT_OBJECT_UID,
  MEETING_TO_SALES_NOTES_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_TO_MEETING_FIELD_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: SALES_NOTE_TO_MEETING_FIELD_UID,
  objectUniversalIdentifier: SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'meeting',
  label: 'Meeting',
  description:
    "Synced calendar event this Call Report was written for. Set this and the meeting's matched attendees are inherited automatically.",
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: CALENDAR_EVENT_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier:
    MEETING_TO_SALES_NOTES_FIELD_UID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'meetingId',
  },
});
