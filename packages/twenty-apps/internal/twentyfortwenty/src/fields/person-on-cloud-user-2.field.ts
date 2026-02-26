import {
    defineField,
    FieldType,
    OnDeleteAction,
    RelationType,
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

import {
    CLOUD_USERS_2_ON_PERSON_ID,
    PERSON_ON_CLOUD_USER_2_ID,
} from 'src/fields/cloud-users-2-on-person.field';
import { CLOUD_USER_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-2';

export default defineField({
  universalIdentifier: PERSON_ON_CLOUD_USER_2_ID,
  objectUniversalIdentifier: CLOUD_USER_2_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: CLOUD_USERS_2_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'personId',
  },
});
