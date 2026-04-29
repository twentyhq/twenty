// Person → salesNoteAttendees (ONE_TO_MANY reverse side)
import {
  ATTENDEE_TO_PERSON_FIELD_UID,
  PERSON_OBJECT_UID,
  PERSON_TO_ATTENDEES_FIELD_UID,
  SALES_NOTE_ATTENDEE_OBJECT_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: PERSON_TO_ATTENDEES_FIELD_UID,
  objectUniversalIdentifier: PERSON_OBJECT_UID,
  type: FieldType.RELATION,
  name: 'salesNoteAttendees',
  label: 'Sales note attendances',
  description:
    'Junction rows linking this Person to sales notes they attended. Use the salesNote relation on each row to reach the actual notes.',
  icon: 'IconUsers',
  relationTargetObjectMetadataUniversalIdentifier:
    SALES_NOTE_ATTENDEE_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier: ATTENDEE_TO_PERSON_FIELD_UID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
