import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import {
  OPPORTUNITY_WHATSAPP_AD_REFERRALS_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_AD_REFERRAL_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_AD_REFERRAL_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_WHATSAPP_AD_REFERRALS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'whatsAppAdReferrals',
  label: 'WhatsApp ad referrals',
  description: 'Click-to-WhatsApp ads this opportunity came from',
  icon: 'IconAd',
  relationTargetObjectMetadataUniversalIdentifier: WHATSAPP_AD_REFERRAL_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: WHATSAPP_AD_REFERRAL_FIELD_UNIVERSAL_IDENTIFIERS.opportunity,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
