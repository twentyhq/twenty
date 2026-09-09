import { GRANOLA_WEBHOOK_REGISTRATION_ROUTE_PATH } from 'src/constants/granola-webhook-registration-route-path';
import { postGranolaWebhookActionOrThrow } from 'src/front-components/utils/post-granola-webhook-action-or-throw.util';

export const registerGranolaWebhookOrThrow = (): Promise<void> =>
  postGranolaWebhookActionOrThrow(GRANOLA_WEBHOOK_REGISTRATION_ROUTE_PATH);
