import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';
import { type MessengerReferral } from 'src/logic-functions/types/messenger-webhook.type';

// one opportunity per person and ad: the ad's first message and a referral event can both report the same click
export const claimAdOpportunity = async ({
  personId,
  referral,
}: {
  personId: string;
  referral: MessengerReferral;
}): Promise<boolean> => {
  const claimKey = `${MESSENGER_KV_KEY_PREFIXES.adOpportunityByPersonAndAd}${personId}:${referral.ad_id ?? referral.ref ?? 'unknown-ad'}`;

  if (isDefined(await kv.get<boolean>(claimKey))) {
    return false;
  }

  await kv.set(claimKey, true);

  return true;
};
