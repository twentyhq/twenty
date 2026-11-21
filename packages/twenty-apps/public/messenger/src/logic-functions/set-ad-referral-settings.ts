import { isBoolean } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  AD_REFERRAL_SETTINGS_KV_KEY,
  AD_REFERRAL_SETTINGS_SET_ROUTE_PATH,
} from 'src/constants/ad-referral-settings.constant';
import { MESSENGER_LOGIC_FUNCTION_SET_AD_REFERRAL_SETTINGS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageApplications } from 'src/logic-functions/data/current-user-can-manage-applications.util';
import { type AdReferralSettings } from 'src/logic-functions/types/ad-referral-settings.type';
import { type SettingsRouteResult } from 'src/logic-functions/types/settings-route-result.type';

const handler = async (
  params: RoutePayload<{ isOpportunityCreated?: unknown }>,
): Promise<SettingsRouteResult> => {
  const isOpportunityCreated = params.body?.isOpportunityCreated;

  if (!isBoolean(isOpportunityCreated)) {
    return { success: false, error: 'isOpportunityCreated must be a boolean.' };
  }

  if (!(await currentUserCanManageApplications())) {
    return {
      success: false,
      error: 'Only members who can manage applications can change this setting.',
    };
  }

  await kv.set<AdReferralSettings>(AD_REFERRAL_SETTINGS_KV_KEY, {
    isOpportunityCreated,
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_SET_AD_REFERRAL_SETTINGS_UNIVERSAL_IDENTIFIER,
  name: 'set-ad-referral-settings',
  description:
    'Saves what happens when someone starts a conversation from a Click-to-Messenger ad',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: AD_REFERRAL_SETTINGS_SET_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
