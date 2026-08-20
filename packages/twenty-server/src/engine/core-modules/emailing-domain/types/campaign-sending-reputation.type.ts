export type CampaignSendingReputation = {
  attemptedCount: number;
  bouncedCount: number;
  complainedCount: number;
  bounceRate: number | null;
  complaintRate: number | null;
  isSendingBlocked: boolean;
};
