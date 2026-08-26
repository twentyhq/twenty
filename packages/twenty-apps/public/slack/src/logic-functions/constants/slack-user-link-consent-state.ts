export const SLACK_USER_LINK_CONSENT_STATE = {
  // In-workspace manual link waiting for the Slack user to approve the consent DM.
  PENDING: 'PENDING',
  // Consented by the Slack user, or matched on their own verified email.
  ACTIVE: 'ACTIVE',
  // The Slack user declined the consent DM.
  DECLINED: 'DECLINED',
  // Admin-set for a guest or Slack Connect user we cannot DM for consent.
  ADMIN_SET: 'ADMIN_SET',
} as const;
