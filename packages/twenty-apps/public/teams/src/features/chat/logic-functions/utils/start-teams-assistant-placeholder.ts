import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ASSISTANT_INITIAL_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-status-steps';
import { type TeamsAssistantStatusWriter } from 'src/features/chat/logic-functions/types/teams-assistant-status-writer.type';
import { deleteTeamsActivity } from 'src/features/chat/logic-functions/utils/delete-teams-activity';
import { deleteTeamsAssistantPlaceholderActivityId } from 'src/features/chat/logic-functions/utils/delete-teams-assistant-placeholder-activity-id';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { readTeamsAssistantPlaceholderActivityId } from 'src/features/chat/logic-functions/utils/read-teams-assistant-placeholder-activity-id';
import { saveTeamsAssistantPlaceholderActivityId } from 'src/features/chat/logic-functions/utils/save-teams-assistant-placeholder-activity-id';
import { sendTeamsMessage } from 'src/features/chat/logic-functions/utils/send-teams-message';
import { updateTeamsMessage } from 'src/features/chat/logic-functions/utils/update-teams-message';

type TeamsConversation = {
  serviceUrl: string;
  conversationId: string;
};

const postPlaceholder = async ({
  requestId,
  ...conversation
}: TeamsConversation & { requestId: string }): Promise<string | undefined> => {
  try {
    const { id: activityId } = await sendTeamsMessage({
      ...conversation,
      text: TEAMS_ASSISTANT_INITIAL_STATUS,
    });

    await saveTeamsAssistantPlaceholderActivityId({ requestId, activityId });

    return activityId;
  } catch (error) {
    console.warn(
      `[teams] could not post a placeholder in ${conversation.conversationId}`,
      error,
    );

    return undefined;
  }
};

const deletePlaceholder = async ({
  activityId,
  ...conversation
}: TeamsConversation & { activityId: string }): Promise<void> => {
  try {
    await deleteTeamsActivity({
      ...conversation,
      activityId,
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
    });
  } catch (error) {
    console.warn(
      `[teams] could not delete the placeholder in ${conversation.conversationId}`,
      error,
    );
  }
};

// The placeholder id is stored per request so a resumed run or the job failure handler can replace the same message.
export const startTeamsAssistantPlaceholder = async ({
  serviceUrl,
  conversationId,
  requestId,
}: TeamsConversation & { requestId: string }): Promise<
  Pick<TeamsAssistantStatusWriter, 'finish'>
> => {
  const conversation = { serviceUrl, conversationId };
  const activityId =
    (await readTeamsAssistantPlaceholderActivityId({ requestId })) ??
    (await postPlaceholder({ ...conversation, requestId }));

  return {
    finish: async (text) => {
      if (!isDefined(activityId)) {
        await sendTeamsMessage({ ...conversation, text });

        return;
      }

      try {
        await updateTeamsMessage({ ...conversation, activityId, text });
      } catch (error) {
        console.warn(
          `[teams] could not replace the placeholder in ${conversationId}`,
          error,
        );

        // A failed send throws before the delete, leaving the placeholder for the caller's failure text.
        await sendTeamsMessage({ ...conversation, text });
        await deletePlaceholder({ ...conversation, activityId });
      }

      await deleteTeamsAssistantPlaceholderActivityId({ requestId });
    },
  };
};
