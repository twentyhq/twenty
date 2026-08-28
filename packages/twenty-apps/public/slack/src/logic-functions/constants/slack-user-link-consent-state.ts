export const SLACK_USER_LINK_CONSENT_STATE = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  DECLINED: 'DECLINED',
  // Counts as consented: guests and Slack Connect users from another
  // workspace cannot be DMed, so an admin's explicit link is authoritative.
  ADMIN_SET: 'ADMIN_SET',
} as const;
