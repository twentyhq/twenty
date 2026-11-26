import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ASSISTANT_INITIAL_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-status-steps';
import { type TeamsAssistantStatusWriter } from 'src/features/chat/logic-functions/types/teams-assistant-status-writer.type';
import { buildTeamsMessageActivity } from 'src/features/chat/logic-functions/utils/build-teams-message-activity';
import { deleteTeamsActivity } from 'src/features/chat/logic-functions/utils/delete-teams-activity';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';
import { updateTeamsActivity } from 'src/features/chat/logic-functions/utils/update-teams-activity';

export const startTeamsAssistantPlaceholder = async ({
  serviceUrl,
  conversationId,
  sendMessage,
}: {
  serviceUrl: string;
  conversationId: string;
  sendMessage: (text: string) => Promise<void>;
}): Promise<Pick<TeamsAssistantStatusWriter, 'finish'>> => {
  let placeholderActivityId = await getTeamsConnectorAccessTokenOrThrow()
    .then((accessToken) =>
      sendTeamsActivity({
        serviceUrl,
        conversationId,
        accessToken,
        activity: buildTeamsMessageActivity({
          text: TEAMS_ASSISTANT_INITIAL_STATUS,
        }),
      }),
    )
    .then(({ id }) => id)
    .catch((error: unknown) => {
      console.warn(
        `[teams] could not post a placeholder in ${conversationId}`,
        error,
      );

      return undefined;
    });

  return {
    finish: async (text) => {
      if (!isDefined(placeholderActivityId)) {
        return sendMessage(text);
      }

      const activityId = placeholderActivityId;

      try {
        await updateTeamsActivity({
          serviceUrl,
          conversationId,
          activityId,
          accessToken: await getTeamsConnectorAccessTokenOrThrow(),
          activity: buildTeamsMessageActivity({ text }),
        });
        placeholderActivityId = undefined;

        return;
      } catch (error) {
        console.warn(
          `[teams] could not replace the placeholder in ${conversationId}`,
          error,
        );
      }

      await sendMessage(text);
      placeholderActivityId = undefined;

      await getTeamsConnectorAccessTokenOrThrow()
        .then((accessToken) =>
          deleteTeamsActivity({
            serviceUrl,
            conversationId,
            activityId,
            accessToken,
          }),
        )
        .catch((error: unknown) => {
          console.warn(
            `[teams] could not delete the placeholder in ${conversationId}`,
            error,
          );
        });
    },
  };
};
