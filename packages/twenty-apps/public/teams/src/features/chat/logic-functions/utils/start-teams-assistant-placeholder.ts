import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ASSISTANT_INITIAL_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-status-steps';
import { type TeamsAssistantStatusWriter } from 'src/features/chat/logic-functions/types/teams-assistant-status-writer.type';
import { buildTeamsMessageActivity } from 'src/features/chat/logic-functions/utils/build-teams-message-activity';
import { deleteTeamsActivity } from 'src/features/chat/logic-functions/utils/delete-teams-activity';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { sendTeamsMessage } from 'src/features/chat/logic-functions/utils/send-teams-message';
import { updateTeamsActivity } from 'src/features/chat/logic-functions/utils/update-teams-activity';

type TeamsConversation = {
  serviceUrl: string;
  conversationId: string;
};

const postPlaceholder = async (
  conversation: TeamsConversation,
): Promise<string | undefined> => {
  try {
    const { id } = await sendTeamsMessage({
      ...conversation,
      text: TEAMS_ASSISTANT_INITIAL_STATUS,
    });

    return id;
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

export const startTeamsAssistantPlaceholder = async ({
  serviceUrl,
  conversationId,
}: TeamsConversation): Promise<Pick<TeamsAssistantStatusWriter, 'finish'>> => {
  const conversation = { serviceUrl, conversationId };
  const activityId = await postPlaceholder(conversation);

  return {
    finish: async ({ text, answerMarkers }) => {
      const sendMessage = async () => {
        const { id } = await sendTeamsMessage({
          ...conversation,
          text,
          answerMarkers,
        });

        return id;
      };

      if (!isDefined(activityId)) {
        return sendMessage();
      }

      try {
        await updateTeamsActivity({
          ...conversation,
          activityId,
          accessToken: await getTeamsConnectorAccessTokenOrThrow(),
          activity: buildTeamsMessageActivity({ text, ...answerMarkers }),
        });

        return activityId;
      } catch (error) {
        console.warn(
          `[teams] could not replace the placeholder in ${conversationId}`,
          error,
        );
      }

      // The placeholder is only deleted once the text is delivered, so a failed send leaves it for the caller's failure text.
      const sentActivityId = await sendMessage();

      await deletePlaceholder({ ...conversation, activityId });

      return sentActivityId;
    },
  };
};
