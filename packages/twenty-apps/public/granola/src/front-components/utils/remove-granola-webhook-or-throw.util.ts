import { GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH } from 'src/constants/granola-webhook-removal-route-path';
import { postGranolaWebhookActionOrThrow } from 'src/front-components/utils/post-granola-webhook-action-or-throw.util';

export const removeGranolaWebhookOrThrow = (): Promise<void> =>
  postGranolaWebhookActionOrThrow(GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH);
