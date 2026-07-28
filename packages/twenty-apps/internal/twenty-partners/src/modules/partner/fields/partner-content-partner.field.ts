import { FieldType, OnDeleteAction, RelationType, defineField } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER, PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_CONTENT_PARTNER_FIELD_ID = '1774738e-96a1-43e2-aca4-d3c7cc794c50';
export const PARTNER_CONTENTS_ON_PARTNER_FIELD_ID = 'ac7995f1-7ccf-4607-827b-0788eeacaee0';

export default defineField({
  universalIdentifier: PARTNER_CONTENT_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partner',
  label: 'Partner',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_CONTENTS_ON_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerId',
  },
});
