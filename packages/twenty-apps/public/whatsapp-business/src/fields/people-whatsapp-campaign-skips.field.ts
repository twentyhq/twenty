import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import {
  PERSON_WHATSAPP_CAMPAIGN_SKIPS_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGN_SKIP_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_CAMPAIGN_SKIP_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PERSON_WHATSAPP_CAMPAIGN_SKIPS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'whatsAppCampaignSkips',
  label: 'Skipped WhatsApp campaigns',
  description: 'WhatsApp campaigns that did not send to this person, and why',
  icon: 'IconUserOff',
  relationTargetObjectMetadataUniversalIdentifier: WHATSAPP_CAMPAIGN_SKIP_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: WHATSAPP_CAMPAIGN_SKIP_FIELD_UNIVERSAL_IDENTIFIERS.person,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
  isUIEditable: false,
});
