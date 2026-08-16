import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
import { Webhook } from "src/logic-functions/types/webhook.type";

const QUERY = `query findWebhooks {
  webhooks {
    id
    targetUrl
    operations
    description
  }
}`;

export const findWebhooks = async (client: AxiosInstance): Promise<Webhook[]> => {
  const data = await postGraphql<{ webhooks: Webhook[] }>(
    client,
    '/metadata',
    'findWebhooks',
    QUERY,
  );

  return data.webhooks;
}
