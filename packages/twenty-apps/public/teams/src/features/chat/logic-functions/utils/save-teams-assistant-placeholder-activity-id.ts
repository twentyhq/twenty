import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsAssistantPlaceholderKvKey } from 'src/features/chat/logic-functions/utils/build-teams-assistant-placeholder-kv-key';

export const saveTeamsAssistantPlaceholderActivityId = async ({
  requestId,
  activityId,
}: {
  requestId: string;
  activityId: string;
}): Promise<void> => {
  try {
    await kv.set(
      buildTeamsAssistantPlaceholderKvKey({ requestId }),
      activityId,
    );
  } catch (error) {
    console.warn(
      `[teams] could not save the placeholder of request ${requestId}`,
      error,
    );
  }
};
