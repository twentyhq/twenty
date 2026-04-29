// salesNoteAttendee → Person (MANY_TO_ONE side)
import {
  ATTENDEE_TO_PERSON_FIELD_UID,
  PERSON_OBJECT_UID,
  PERSON_TO_ATTENDEES_FIELD_UID,
  SALES_NOTE_ATTENDEE_OBJECT_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: ATTENDEE_TO_PERSON_FIELD_UID,
  objectUniversalIdentifier: SALES_NOTE_ATTENDEE_OBJECT_UID,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  description: 'The Person this attendee row references',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: PERSON_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier:
    PERSON_TO_ATTENDEES_FIELD_UID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
});
