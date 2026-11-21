import { MESSENGER_WEBHOOK_FIELDS } from 'src/constants/messenger-webhook-fields.constant';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';

export const subscribePage = ({
  pageId,
  pageAccessToken,
}: {
  pageId: string;
  pageAccessToken: string;
}) =>
  graphApiRequest({
    accessToken: pageAccessToken,
    method: 'POST',
    path: `${pageId}/subscribed_apps`,
    query: { subscribed_fields: MESSENGER_WEBHOOK_FIELDS.join(',') },
  });
