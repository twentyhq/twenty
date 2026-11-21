import { kv } from 'twenty-sdk/logic-function';

import { AD_REFERRAL_SETTINGS_KV_KEY } from 'src/constants/ad-referral-settings.constant';
import { type AdReferralSettings } from 'src/logic-functions/types/ad-referral-settings.type';

export const getAdReferralSettings = async (): Promise<AdReferralSettings> => ({
  isOpportunityCreated: false,
  ...(await kv.get<AdReferralSettings>(AD_REFERRAL_SETTINGS_KV_KEY)),
});
