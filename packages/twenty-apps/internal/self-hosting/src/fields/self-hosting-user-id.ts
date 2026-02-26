import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

export const SELF_HOSTING_USER_ID_UNIVERSAL_IDENTIFIER =
  '9507f244-fdea-47d5-a734-725d4dae43da';

export default defineField({
  universalIdentifier: SELF_HOSTING_USER_ID_UNIVERSAL_IDENTIFIER,
  name: 'selfHostingUser',
  label: 'Self hosting user id',
  type: FieldType.RELATION,
  relationTargetFieldMetadataUniversalIdentifier:
    UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personId
      .universalIdentifier,
  relationTargetObjectMetadataUniversalIdentifier:
    UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.universalIdentifier,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  description: 'Self hosting user related to the person',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'selfHostingUserId',
    onDelete: OnDeleteAction.SET_NULL,
  },
});
