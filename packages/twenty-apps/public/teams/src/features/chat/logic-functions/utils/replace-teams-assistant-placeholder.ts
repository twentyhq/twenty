import { isDefined } from 'twenty-sdk/utils';

import { readTeamsAssistantPlaceholderActivityId } from 'src/features/chat/logic-functions/utils/read-teams-assistant-placeholder-activity-id';
import { updateTeamsMessage } from 'src/features/chat/logic-functions/utils/update-teams-message';

export const replaceTeamsAssistantPlaceholder = async ({
  serviceUrl,
  conversationId,
  requestId,
  text,
}: {
  serviceUrl: string;
  conversationId: string;
  requestId: string;
  text: string;
}): Promise<boolean> => {
  const activityId = await readTeamsAssistantPlaceholderActivityId({
    requestId,
  });

  if (!isDefined(activityId)) {
    return false;
  }

  try {
    await updateTeamsMessage({ serviceUrl, conversationId, activityId, text });

    return true;
  } catch (error) {
    console.warn(
      `[teams] could not replace the placeholder in ${conversationId}`,
      error,
    );

    return false;
  }
};
