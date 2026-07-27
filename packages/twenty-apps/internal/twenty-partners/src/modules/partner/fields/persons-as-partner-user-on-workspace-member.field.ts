import { FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_USER_ON_PERSON_FIELD_ID, PERSONS_AS_PARTNER_USER_FIELD_ID } from './partner-user-on-person.field';

export default defineField({
  universalIdentifier: PERSONS_AS_PARTNER_USER_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'personsAsPartnerUser',
  label: 'People (as partner user)',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_USER_ON_PERSON_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
