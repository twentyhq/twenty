import { FieldType, OnDeleteAction, RelationType, defineField } from 'twenty-sdk/define';

import {
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export const PARTNER_SERVICE_PARTNER_FIELD_ID =
  'cc2f1f32-65a0-46df-977f-fffc278b899a';
export const PARTNER_SERVICES_ON_PARTNER_FIELD_ID =
  '88ac0831-91d5-4131-823f-3e72de8105b5';

export default defineField({
  universalIdentifier: PARTNER_SERVICE_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partner',
  label: 'Partner',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTNER_SERVICES_ON_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerId',
  },
});
