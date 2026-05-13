// calendarEvent → salesNotes (ONE_TO_MANY reverse)
import {
  CALENDAR_EVENT_OBJECT_UID,
  MEETING_TO_SALES_NOTES_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_TO_MEETING_FIELD_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: MEETING_TO_SALES_NOTES_FIELD_UID,
  objectUniversalIdentifier: CALENDAR_EVENT_OBJECT_UID,
  type: FieldType.RELATION,
  name: 'salesNotes',
  label: 'Call reports',
  description: 'Call reports written for this meeting',
  icon: 'IconNotebook',
  relationTargetObjectMetadataUniversalIdentifier:
    SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SALES_NOTE_TO_MEETING_FIELD_UID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
