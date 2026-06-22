import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { TICKET_OBJECT_ID } from 'src/constants/universal-identifiers';

export const PERSON_TICKETS_FIELD_ID = 'c4448b2f-5202-44f3-8098-908081db7cc9';

export default defineField({
  universalIdentifier: PERSON_TICKETS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'tickets',
  label: 'Tickets',
  icon: 'IconTicket',
  relation: {
    type: 'ONE_TO_MANY',
    targetObjectUniversalIdentifier: TICKET_OBJECT_ID,
    joinColumn: 'personId',
  },
});
