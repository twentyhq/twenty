// salesNote → salesNoteAttendees (ONE_TO_MANY reverse side)
import {
  ATTENDEE_TO_SALES_NOTE_FIELD_UID,
  SALES_NOTE_ATTENDEES_FIELD_UID,
  SALES_NOTE_ATTENDEE_OBJECT_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: SALES_NOTE_ATTENDEES_FIELD_UID,
  objectUniversalIdentifier: SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'attendees',
  label: 'Attendees',
  description:
    'People who were in the call/meeting this note covers (junction via salesNoteAttendee).',
  icon: 'IconUsers',
  relationTargetObjectMetadataUniversalIdentifier:
    SALES_NOTE_ATTENDEE_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier:
    ATTENDEE_TO_SALES_NOTE_FIELD_UID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
