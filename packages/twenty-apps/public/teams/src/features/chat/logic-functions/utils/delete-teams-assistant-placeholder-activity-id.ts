import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsAssistantPlaceholderKvKey } from 'src/features/chat/logic-functions/utils/build-teams-assistant-placeholder-kv-key';

export const deleteTeamsAssistantPlaceholderActivityId = async ({
  requestId,
}: {
  requestId: string;
}): Promise<void> => {
  try {
    await kv.delete(buildTeamsAssistantPlaceholderKvKey({ requestId }));
  } catch (error) {
    console.warn(
      `[teams] could not forget the placeholder of request ${requestId}`,
      error,
    );
  }
};
