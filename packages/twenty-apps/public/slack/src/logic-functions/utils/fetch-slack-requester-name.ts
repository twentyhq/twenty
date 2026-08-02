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
    const displayName = userInfo.user?.profile?.display_name;
    const realName = userInfo.user?.real_name;

    if (isNonEmptyString(displayName)) {
      return displayName;
    }

    return isNonEmptyString(realName) ? realName : undefined;
  } catch {
    return undefined;
  }
};
