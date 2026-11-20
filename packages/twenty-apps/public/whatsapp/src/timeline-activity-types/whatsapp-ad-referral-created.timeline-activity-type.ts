import { defineTimelineActivityType } from 'twenty-sdk/define';

import {
  WHATSAPP_AD_REFERRAL_CREATED_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_AD_REFERRAL_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_AD_REFERRAL_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineTimelineActivityType({
  universalIdentifier: WHATSAPP_AD_REFERRAL_CREATED_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppAdReferralCreated',
  label: 'arrived from a WhatsApp ad',
  icon: 'IconBrandWhatsapp',
  emit: {
    on: 'created',
    objectUniversalIdentifier: WHATSAPP_AD_REFERRAL_UNIVERSAL_IDENTIFIER,
    through: {
      relationFieldUniversalIdentifier: WHATSAPP_AD_REFERRAL_FIELD_UNIVERSAL_IDENTIFIERS.person,
      happensAtFieldUniversalIdentifier: WHATSAPP_AD_REFERRAL_FIELD_UNIVERSAL_IDENTIFIERS.referredAt,
    },
  },
});
