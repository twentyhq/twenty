import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsAssistantPlaceholderKvKey } from 'src/features/chat/logic-functions/utils/build-teams-assistant-placeholder-kv-key';

export const readTeamsAssistantPlaceholderActivityId = async ({
  requestId,
}: {
  requestId: string;
}): Promise<string | undefined> => {
  try {
    const activityId = await kv.get<string>(
      buildTeamsAssistantPlaceholderKvKey({ requestId }),
    );

    return isNonEmptyString(activityId) ? activityId : undefined;
  } catch (error) {
    console.warn(
      `[teams] could not read the placeholder of request ${requestId}`,
      error,
    );

    return undefined;
  }
};
