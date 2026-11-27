export const INVITATION_SENDING_BY_SENDER_THROTTLE = {
  limit: 20,
  sameWorkDomainLimit: 50,
  ttlInMs: 86_400_000,
} as const;
