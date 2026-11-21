import { type MessengerReferral } from 'src/logic-functions/types/messenger-webhook.type';

// every field is written, so an m.me referral clears the ad of an older one
export const buildReferralPersonFields = ({
  referral,
  referredAt,
}: {
  referral: MessengerReferral;
  referredAt: Date;
}) => ({
  messengerReferralSource: referral.source ?? null,
  messengerReferralRef: referral.ref ?? null,
  messengerAdId: referral.ad_id ?? null,
  messengerAdTitle: referral.ads_context_data?.ad_title ?? null,
  messengerReferredAt: referredAt.toISOString(),
});
