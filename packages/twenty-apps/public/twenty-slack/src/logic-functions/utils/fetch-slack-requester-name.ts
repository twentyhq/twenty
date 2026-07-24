import { type WebClient } from '@slack/web-api';

import { isNonEmptyString } from '@sniptt/guards';

export const fetchSlackRequesterName = async ({
  client,
  slackUserId,
}: {
  client: WebClient;
  slackUserId: string | undefined;
}): Promise<string | undefined> => {
  if (!isNonEmptyString(slackUserId)) {
    return undefined;
  }

  try {
    const userInfo = await client.users.info({ user: slackUserId });

    return (
      userInfo.user?.profile?.display_name || userInfo.user?.real_name || undefined
    );
  } catch {
    return undefined;
  }
};
