// salesNoteAttendee → salesNote (MANY_TO_ONE side)
import {
  ATTENDEE_TO_SALES_NOTE_FIELD_UID,
  SALES_NOTE_ATTENDEES_FIELD_UID,
  SALES_NOTE_ATTENDEE_OBJECT_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: ATTENDEE_TO_SALES_NOTE_FIELD_UID,
  objectUniversalIdentifier: SALES_NOTE_ATTENDEE_OBJECT_UID,
  type: FieldType.RELATION,
  name: 'salesNote',
  label: 'Sales note',
  description: 'The sales note this attendee row links to',
  icon: 'IconNotebook',
  relationTargetObjectMetadataUniversalIdentifier:
    SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SALES_NOTE_ATTENDEES_FIELD_UID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'salesNoteId',
  },
});
