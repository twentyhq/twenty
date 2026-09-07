export const getFathomWebhookRegistrationKey = (
  connectedAccountId: string,
): string => `fathom-webhook:${connectedAccountId}`;
