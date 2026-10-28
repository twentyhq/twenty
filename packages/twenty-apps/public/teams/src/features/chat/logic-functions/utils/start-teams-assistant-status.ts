import { isDefined } from 'twenty-sdk/utils';

import {
  TEAMS_ASSISTANT_INITIAL_STATUS,
  TEAMS_ASSISTANT_STATUS_STEPS,
} from 'src/features/chat/logic-functions/constants/teams-assistant-status-steps';
import { TEAMS_PERSONAL_CONVERSATION_TYPE } from 'src/features/chat/logic-functions/constants/teams-personal-conversation-type';
import { type TeamsAssistantStatusWriter } from 'src/features/chat/logic-functions/types/teams-assistant-status-writer.type';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';
import { startTeamsAssistantStream } from 'src/features/chat/logic-functions/utils/start-teams-assistant-stream';

const PENDING_UPDATE_WAIT_MS = 5000;

// Teams only streams in one-on-one chats, so other conversations get a plain reply at the end.
export const startTeamsAssistantStatus = async ({
  serviceUrl,
  conversationId,
  conversationType,
}: {
  serviceUrl: string;
  conversationId: string;
  conversationType: string;
}): Promise<Pick<TeamsAssistantStatusWriter, 'finish'>> => {
  const sendMessage = async (text: string) => {
    await sendTeamsActivity({
      serviceUrl,
      conversationId,
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
      activity: { type: 'message', text },
    });
  };

  const writer =
    conversationType === TEAMS_PERSONAL_CONVERSATION_TYPE
      ? await startTeamsAssistantStream({
          serviceUrl,
          conversationId,
          text: TEAMS_ASSISTANT_INITIAL_STATUS,
        }).catch((error: unknown) => {
          console.warn(
            `[teams] could not start a stream in ${conversationId}`,
            error,
          );

          return undefined;
        })
      : undefined;

  if (!isDefined(writer)) {
    return { finish: sendMessage };
  }

  let pendingUpdate = Promise.resolve();

  const timers = TEAMS_ASSISTANT_STATUS_STEPS.map((step) =>
    setTimeout(() => {
      pendingUpdate = pendingUpdate
        .then(() => writer.update(step.text))
        .catch((error: unknown) => {
          console.warn(
            `[teams] could not update the status in ${conversationId}`,
            error,
          );
        });
    }, step.afterSeconds * 1000),
  );

  return {
    finish: async (text) => {
      timers.forEach(clearTimeout);

      let waitTimer: ReturnType<typeof setTimeout> | undefined;

      await Promise.race([
        pendingUpdate,
        new Promise<void>((resolve) => {
          waitTimer = setTimeout(resolve, PENDING_UPDATE_WAIT_MS);
        }),
      ]);
      clearTimeout(waitTimer);

      await writer.finish(text).catch((error: unknown) => {
        console.warn(
          `[teams] could not finish the stream in ${conversationId}`,
          error,
        );

        return sendMessage(text);
      });
    },
  };
};
