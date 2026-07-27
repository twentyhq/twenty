import {
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import { PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_USER_ON_PARTNER_SERVICE_FIELD_ID =
  'e35d5cc8-1217-4676-81b2-51112b716b1c';
export const PARTNER_SERVICES_AS_PARTNER_USER_FIELD_ID =
  'bc7e3a06-d362-4aef-a30b-e8ba0746c781';

export default defineField({
  universalIdentifier: PARTNER_USER_ON_PARTNER_SERVICE_FIELD_ID,
  objectUniversalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partnerUser',
  label: 'Partner User',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTNER_SERVICES_AS_PARTNER_USER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerUserId',
  },
});
