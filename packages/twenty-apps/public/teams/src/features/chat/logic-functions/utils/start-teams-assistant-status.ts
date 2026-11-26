import { isDefined } from 'twenty-sdk/utils';

import {
  TEAMS_ASSISTANT_INITIAL_STATUS,
  TEAMS_ASSISTANT_STATUS_STEPS,
} from 'src/features/chat/logic-functions/constants/teams-assistant-status-steps';
import { TEAMS_PERSONAL_CONVERSATION_TYPE } from 'src/features/chat/logic-functions/constants/teams-personal-conversation-type';
import { type TeamsAssistantStatusWriter } from 'src/features/chat/logic-functions/types/teams-assistant-status-writer.type';
import { sendTeamsMessage } from 'src/features/chat/logic-functions/utils/send-teams-message';
import { startTeamsAssistantPlaceholder } from 'src/features/chat/logic-functions/utils/start-teams-assistant-placeholder';
import { startTeamsAssistantStream } from 'src/features/chat/logic-functions/utils/start-teams-assistant-stream';

const PENDING_UPDATE_WAIT_MS = 5000;

// REST streaming is only documented for one-on-one chats, so other conversations get a placeholder message.
export const startTeamsAssistantStatus = async ({
  serviceUrl,
  conversationId,
  conversationType,
}: {
  serviceUrl: string;
  conversationId: string;
  conversationType: string;
}): Promise<Pick<TeamsAssistantStatusWriter, 'finish'>> => {
  const sendMessage = async (
    message: Parameters<TeamsAssistantStatusWriter['finish']>[0],
  ) => {
    const { id } = await sendTeamsMessage({
      serviceUrl,
      conversationId,
      ...message,
    });

    return id;
  };

  if (conversationType !== TEAMS_PERSONAL_CONVERSATION_TYPE) {
    return startTeamsAssistantPlaceholder({ serviceUrl, conversationId });
  }

  const writer = await startTeamsAssistantStream({
    serviceUrl,
    conversationId,
    text: TEAMS_ASSISTANT_INITIAL_STATUS,
  }).catch((error: unknown) => {
    console.warn(
      `[teams] could not start a stream in ${conversationId}`,
      error,
    );

    return undefined;
  });

  if (!isDefined(writer)) {
    return { finish: sendMessage };
  }

  let pendingUpdate = Promise.resolve();

  const queueStreamCall = (streamCall: () => Promise<void>) => {
    pendingUpdate = pendingUpdate.then(streamCall).catch((error: unknown) => {
      console.warn(
        `[teams] could not update the status in ${conversationId}`,
        error,
      );
    });
  };

  const timers = TEAMS_ASSISTANT_STATUS_STEPS.map((step) =>
    setTimeout(
      () => queueStreamCall(() => writer.update(step.text)),
      step.afterSeconds * 1000,
    ),
  );

  const waitForPendingUpdate = async () => {
    let waitTimer: ReturnType<typeof setTimeout> | undefined;

    await Promise.race([
      pendingUpdate,
      new Promise<void>((resolve) => {
        waitTimer = setTimeout(resolve, PENDING_UPDATE_WAIT_MS);
      }),
    ]);
    clearTimeout(waitTimer);
  };

  return {
    finish: async (message) => {
      timers.forEach(clearTimeout);
      await waitForPendingUpdate();

      return writer.finish(message).catch((error: unknown) => {
        console.warn(
          `[teams] could not finish the stream in ${conversationId}`,
          error,
        );

        return sendMessage(message);
      });
    },
  };
};
