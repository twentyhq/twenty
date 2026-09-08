import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';

export type GranolaStaleRegistration = Pick<
  GranolaWebhookRegistration,
  'registrationId' | 'webhookEndpointId'
>;
