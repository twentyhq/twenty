export type FathomWebhookRegistration = {
  webhookId: string;
  secret: string;
  isActive: boolean;
  isInitialBackfillEnqueued: boolean;
};
