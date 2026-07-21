import {
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_USER_ON_PARTNER_CONTENT_FIELD_ID =
  '8d77a7c6-bf73-4cb7-8a95-93e32d8556e9';
export const PARTNER_CONTENTS_AS_PARTNER_USER_FIELD_ID =
  'acb4da1d-93fe-4f40-b51f-805b334e4970';

export default defineField({
  universalIdentifier: PARTNER_USER_ON_PARTNER_CONTENT_FIELD_ID,
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partnerUser',
  label: 'Partner User',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTNER_CONTENTS_AS_PARTNER_USER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerUserId',
  },
});
