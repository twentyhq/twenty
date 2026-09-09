import {
  SLACK_ASSISTANT_INITIAL_STATUS,
  SLACK_ASSISTANT_STATUS_STEPS,
} from 'src/logic-functions/constants/slack-assistant-status-steps';
import { isDefined } from 'twenty-sdk/utils';

import { resolveBestEffortSlackClient } from 'src/logic-functions/utils/resolve-best-effort-slack-client';
import { setSlackAssistantStatus } from 'src/logic-functions/utils/set-slack-assistant-status';

const STATUS_SHUTDOWN_TIMEOUT_MS = 5000;

export const startSlackAssistantStatusUpdates = ({
  slackChannelId,
  threadTimestamp,
}: {
  slackChannelId: string;
  threadTimestamp: string;
}): (() => Promise<void>) => {
  let isStopped = false;

  const slackClient = resolveBestEffortSlackClient(
    'assistant.threads.setStatus',
  );

  const sendStatus = async (status: string): Promise<void> => {
    const client = await slackClient;

    if (isStopped || !isDefined(client)) {
      return;
    }

    await setSlackAssistantStatus({
      client,
      slackChannelId,
      threadTimestamp,
      status,
    });
  };

  let pendingUpdate = sendStatus(SLACK_ASSISTANT_INITIAL_STATUS);

  const timers = SLACK_ASSISTANT_STATUS_STEPS.map((step) =>
    setTimeout(() => {
      if (isStopped) {
        return;
      }

      pendingUpdate = pendingUpdate.then(() => sendStatus(step.text));
    }, step.afterSeconds * 1000),
  );

  return async () => {
    isStopped = true;
    timers.forEach(clearTimeout);

    let shutdownTimer: ReturnType<typeof setTimeout> | undefined;

    await Promise.race([
      pendingUpdate,
      new Promise<void>((resolve) => {
        shutdownTimer = setTimeout(resolve, STATUS_SHUTDOWN_TIMEOUT_MS);
      }),
    ]);

    clearTimeout(shutdownTimer);
  };
};
