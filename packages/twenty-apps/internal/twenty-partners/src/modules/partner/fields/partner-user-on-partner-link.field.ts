import {
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import { PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_USER_ON_PARTNER_LINK_FIELD_ID =
  '294ea3dc-9195-4a2a-8823-18d906f66f83';
export const PARTNER_LINKS_AS_PARTNER_USER_FIELD_ID =
  '81a977c0-85fa-4261-953c-f721b1c9604d';

export default defineField({
  universalIdentifier: PARTNER_USER_ON_PARTNER_LINK_FIELD_ID,
  objectUniversalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partnerUser',
  label: 'Partner User',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTNER_LINKS_AS_PARTNER_USER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerUserId',
  },
});
