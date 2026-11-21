import { defineLogicFunction } from 'twenty-sdk/define';

import { AD_REFERRAL_SETTINGS_GET_ROUTE_PATH } from 'src/constants/ad-referral-settings.constant';
import { MESSENGER_LOGIC_FUNCTION_GET_AD_REFERRAL_SETTINGS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageApplications } from 'src/logic-functions/data/current-user-can-manage-applications.util';
import { getAdReferralSettings } from 'src/logic-functions/data/get-ad-referral-settings.util';
import { type GetAdReferralSettingsResult } from 'src/logic-functions/types/ad-referral-settings.type';

const handler = async (): Promise<GetAdReferralSettingsResult> => {
  const [settings, canEdit] = await Promise.all([
    getAdReferralSettings(),
    currentUserCanManageApplications(),
  ]);

  return { ...settings, canEdit };
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_GET_AD_REFERRAL_SETTINGS_UNIVERSAL_IDENTIFIER,
  name: 'get-ad-referral-settings',
  description:
    'Returns what happens when someone starts a conversation from a Click-to-Messenger ad',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: AD_REFERRAL_SETTINGS_GET_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
