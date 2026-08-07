import {
  SLACK_ASSISTANT_INITIAL_STATUS,
  SLACK_ASSISTANT_STATUS_STEPS,
} from 'src/logic-functions/constants/slack-assistant-status-steps';
import { setSlackAssistantStatus } from 'src/logic-functions/utils/set-slack-assistant-status';

export const startSlackAssistantStatusUpdates = ({
  slackChannelId,
  threadTimestamp,
}: {
  slackChannelId: string;
  threadTimestamp: string;
}): (() => Promise<void>) => {
  let isStopped = false;
  let pendingUpdate: Promise<void> = setSlackAssistantStatus({
    slackChannelId,
    threadTimestamp,
    status: SLACK_ASSISTANT_INITIAL_STATUS,
  });

  const timers = SLACK_ASSISTANT_STATUS_STEPS.map((step) =>
    setTimeout(() => {
      if (isStopped) {
        return;
      }

      pendingUpdate = pendingUpdate.then(() =>
        setSlackAssistantStatus({
          slackChannelId,
          threadTimestamp,
          status: step.text,
        }),
      );
    }, step.afterSeconds * 1000),
  );

  return async () => {
    isStopped = true;
    timers.forEach(clearTimeout);

    await pendingUpdate;
  };
};
