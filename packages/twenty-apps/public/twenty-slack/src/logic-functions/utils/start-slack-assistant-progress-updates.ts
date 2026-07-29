import { SLACK_ASSISTANT_PROGRESS_STEPS } from 'src/logic-functions/constants/slack-assistant-progress-steps';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';

export const startSlackAssistantProgressUpdates = ({
  slackChannelId,
  placeholderTimestamp,
}: {
  slackChannelId: string;
  placeholderTimestamp: string;
}): (() => Promise<void>) => {
  let isStopped = false;
  let pendingUpdate: Promise<unknown> = Promise.resolve();

  const timers = SLACK_ASSISTANT_PROGRESS_STEPS.map((step) =>
    setTimeout(() => {
      if (isStopped) {
        return;
      }

      pendingUpdate = slackUpdateMessageHandler({
        slackChannelId,
        messageTimestamp: placeholderTimestamp,
        newMessageText: step.text,
      }).catch(() => undefined);
    }, step.afterSeconds * 1000),
  );

  // awaiting the in-flight update keeps a late progress edit from landing on
  // top of the final answer
  return async () => {
    isStopped = true;
    timers.forEach(clearTimeout);

    await pendingUpdate;
  };
};
