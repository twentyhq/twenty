export const getGranolaPersonalWebhookKey = (connectionId: string): string =>
  `granola:personal-webhook:${connectionId}`;

export const GRANOLA_PERSONAL_REGISTRATION_PREFIX = 'personal-';
