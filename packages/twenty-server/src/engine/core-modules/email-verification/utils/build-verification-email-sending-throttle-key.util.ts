export const buildVerificationEmailSendingThrottleKey = (
  recipientEmailOrUserId: string,
) => `verification-email-sending:throttler:${recipientEmailOrUserId}`;
