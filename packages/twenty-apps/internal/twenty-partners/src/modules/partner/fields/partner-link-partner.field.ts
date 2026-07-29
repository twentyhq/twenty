import { FieldType, OnDeleteAction, RelationType, defineField } from 'twenty-sdk/define';

import {
  PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export const PARTNER_LINK_PARTNER_FIELD_ID = 'bae4dda8-8785-4867-a22f-dd66d805d68e';
export const PARTNER_LINKS_ON_PARTNER_FIELD_ID =
  '3fdc8a67-3881-43ef-8c43-4fa3ddaa819c';

export default defineField({
  universalIdentifier: PARTNER_LINK_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partner',
  label: 'Partner',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_LINKS_ON_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerId',
  },
});
