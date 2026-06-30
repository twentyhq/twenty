import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { TICKET_OBJECT_ID } from 'src/constants/universal-identifiers';
import {
  PERSON_TICKETS_FIELD_ID,
  TICKET_RELATED_PERSON_FIELD_ID,
} from 'src/fields/ticket-related-person.field';

export default defineField({
  universalIdentifier: PERSON_TICKETS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'tickets',
  label: 'Tickets',
  relationTargetObjectMetadataUniversalIdentifier: TICKET_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: TICKET_RELATED_PERSON_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconTicket',
});
