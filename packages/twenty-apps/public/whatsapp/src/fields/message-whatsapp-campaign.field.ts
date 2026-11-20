import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import {
  WHATSAPP_CAMPAIGN_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_CAMPAIGN_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WHATSAPP_CAMPAIGN_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  type: FieldType.RELATION,
  name: 'whatsAppCampaign',
  label: 'WhatsApp campaign',
  description: 'The campaign this WhatsApp template message was sent in',
  icon: 'IconSpeakerphone',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: WHATSAPP_CAMPAIGN_FIELD_UNIVERSAL_IDENTIFIERS.messages,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'whatsAppCampaignId',
  },
  isUIEditable: false,
});
