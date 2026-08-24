export const CAMPAIGN_DELIVERY_STATE = {
  QUEUED: 'QUEUED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
  UNCERTAIN: 'UNCERTAIN',
} as const;

export type CampaignDeliveryState =
  (typeof CAMPAIGN_DELIVERY_STATE)[keyof typeof CAMPAIGN_DELIVERY_STATE];
