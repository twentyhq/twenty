import { RESEND_BROADCASTS_ON_TEMPLATE_ID } from 'src/modules/resend/fields/resend-broadcasts-on-template.field';
import { RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-broadcast';
import { RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-template';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const TEMPLATE_ON_RESEND_BROADCAST_ID =
  '6ff7634b-a501-403c-83ac-3195d21c5dce';

export default defineField({
  universalIdentifier: TEMPLATE_ON_RESEND_BROADCAST_ID,
  objectUniversalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'template',
  label: 'Template',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_BROADCASTS_ON_TEMPLATE_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'templateId',
  },
  icon: 'IconTemplate',
});
