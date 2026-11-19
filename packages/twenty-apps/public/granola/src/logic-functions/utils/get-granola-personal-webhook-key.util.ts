export const getGranolaPersonalWebhookKey = (connectionId: string): string =>
  `granola:personal-webhook:${connectionId}`;
