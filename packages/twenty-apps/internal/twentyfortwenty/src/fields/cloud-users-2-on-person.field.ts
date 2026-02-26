import {
    defineField,
    FieldType,
    RelationType,
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

import { CLOUD_USER_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-2';

export const CLOUD_USERS_2_ON_PERSON_ID =
  'f238e91c-11d8-4a27-a39b-c9fa3515d4a0';
export const PERSON_ON_CLOUD_USER_2_ID =
  '08d3aff0-7548-4a99-a097-20a0ad2c9ee7';

export default defineField({
  universalIdentifier: CLOUD_USERS_2_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'cloudUsers2',
  label: 'Cloud Users 2',
  relationTargetObjectMetadataUniversalIdentifier:
    CLOUD_USER_2_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_ON_CLOUD_USER_2_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
