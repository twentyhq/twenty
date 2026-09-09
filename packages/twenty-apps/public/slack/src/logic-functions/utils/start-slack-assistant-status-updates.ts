import {
  SLACK_ASSISTANT_INITIAL_STATUS,
  SLACK_ASSISTANT_STATUS_STEPS,
} from 'src/logic-functions/constants/slack-assistant-status-steps';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { setSlackAssistantStatus } from 'src/logic-functions/utils/set-slack-assistant-status';

const STATUS_REQUEST_TIMEOUT_MS = 5000;
const STATUS_SHUTDOWN_TIMEOUT_MS = 5000;

export const startSlackAssistantStatusUpdates = ({
  slackChannelId,
  threadTimestamp,
}: {
  slackChannelId: string;
  threadTimestamp: string;
}): (() => Promise<void>) => {
  let isStopped = false;

  const slackClientResult = getSlackClient({
    retryConfig: { retries: 0 },
    timeout: STATUS_REQUEST_TIMEOUT_MS,
  });

  const sendStatus = async (status: string): Promise<void> => {
    const clientResult = await slackClientResult;

    if (isStopped) {
      return;
    }

    if (!clientResult.success) {
      console.warn(
        `[slack] assistant.threads.setStatus skipped: ${clientResult.error}`,
      );

      return;
    }

    await setSlackAssistantStatus({
      client: clientResult.client,
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
