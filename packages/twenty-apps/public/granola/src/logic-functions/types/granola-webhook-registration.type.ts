import { type GranolaWebhookScope } from 'src/logic-functions/types/granola-api.type';

export type GranolaWebhookRegistration = {
  registrationId: string;
  webhookEndpointId: string;
  signingSecret: string;
  apiKeyFingerprint: string;
  scopes: GranolaWebhookScope[];
  folderIds: string[];
  isActive: boolean;
  isInitialBackfillEnqueued: boolean;
};
