import { isNonEmptyString } from '@sniptt/guards';

import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

export const fetchSlackUserEmail = async (
  slackUserId: string,
): Promise<string | undefined> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return undefined;
  }

  try {
    const userInfo = await slackClientResult.client.users.info({
      user: slackUserId,
    });

    if (userInfo.user?.is_bot === true) {
      return undefined;
    }

    const email = userInfo.user?.profile?.email;

    return isNonEmptyString(email) ? email : undefined;
  } catch {
    return undefined;
  }
};
