import { defineView, ViewType } from 'twenty-sdk/define';

import {
  WHATSAPP_AD_REFERRAL_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_AD_REFERRAL_UNIVERSAL_IDENTIFIER,
  WHATSAPP_AD_REFERRALS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_AD_REFERRALS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const VIEW_FIELD_ORDER = ['headline', 'person', 'opportunity', 'referredAt', 'sourceId', 'sourceType', 'adClickId'] as const;

export default defineView({
  universalIdentifier: WHATSAPP_AD_REFERRALS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All WhatsApp ad referrals',
  objectUniversalIdentifier: WHATSAPP_AD_REFERRAL_UNIVERSAL_IDENTIFIER,
  icon: 'IconAd',
  type: ViewType.TABLE,
  position: 0,
  fields: VIEW_FIELD_ORDER.map((fieldName, position) => ({
    universalIdentifier: WHATSAPP_AD_REFERRALS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS[fieldName],
    fieldMetadataUniversalIdentifier: WHATSAPP_AD_REFERRAL_FIELD_UNIVERSAL_IDENTIFIERS[fieldName],
    position,
    isVisible: true,
    size: fieldName === 'headline' ? 240 : 160,
  })),
});
