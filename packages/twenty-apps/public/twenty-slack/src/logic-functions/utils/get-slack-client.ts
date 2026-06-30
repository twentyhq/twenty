import { WebClient } from '@slack/web-api';

import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';

export const getSlackClient = async (): Promise<
  { success: true; client: WebClient } | { success: false; error: string }
> => {
  const connectionResult = await getSlackConnection();

  if (!connectionResult.success) {
    return connectionResult;
  }

  return {
    success: true,
    client: new WebClient(connectionResult.accessToken),
  };
};
