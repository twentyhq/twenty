import {
  RESEND_BROADCASTS_ON_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_ON_RESEND_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export default defineField({
  universalIdentifier: TEMPLATE_ON_RESEND_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'template',
  label: 'Template',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_BROADCASTS_ON_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'templateId',
  },
  icon: 'IconTemplate',
});
