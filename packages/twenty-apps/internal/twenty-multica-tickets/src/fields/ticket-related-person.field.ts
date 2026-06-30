import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { TICKET_OBJECT_ID } from 'src/constants/universal-identifiers';

export const TICKET_RELATED_PERSON_FIELD_ID =
  'c4448b2f-5202-44f3-8098-908081db7cc9';
export const PERSON_TICKETS_FIELD_ID =
  '7d2dc1bb-4108-43ff-99b8-0253c46968d7';

export default defineField({
  universalIdentifier: TICKET_RELATED_PERSON_FIELD_ID,
  objectUniversalIdentifier: TICKET_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'relatedPerson',
  label: 'Related Person',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_TICKETS_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
  icon: 'IconUser',
});
