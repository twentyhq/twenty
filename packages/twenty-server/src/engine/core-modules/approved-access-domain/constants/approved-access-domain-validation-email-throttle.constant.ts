export const APPROVED_ACCESS_DOMAIN_VALIDATION_EMAIL_THROTTLE = {
  byWorkspaceLimit: 5,
  byRecipientLimit: 3,
  ttlInMs: 86_400_000,
} as const;
