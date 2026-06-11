import { FieldType, OnDeleteAction, RelationType, defineField } from 'twenty-sdk/define';

import { APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/application.object';
import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const APPLICATION_PARTNER_FIELD_ID = 'c0a8b1a3-0000-4000-8000-000000000001';
export const APPLICATIONS_ON_PARTNER_FIELD_ID = 'c0a8b1a3-0000-4000-8000-000000000002';

export default defineField({
  universalIdentifier: APPLICATION_PARTNER_FIELD_ID,
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partner',
  label: 'Partner',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: APPLICATIONS_ON_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerId',
  },
});
