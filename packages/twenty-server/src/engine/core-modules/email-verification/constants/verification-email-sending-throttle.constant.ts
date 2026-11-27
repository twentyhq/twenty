export const VERIFICATION_EMAIL_SENDING_THROTTLE = {
  byRecipientLimit: 5,
  emailUpdatesByUserLimit: 5,
  ttlInMs: 86_400_000,
} as const;
