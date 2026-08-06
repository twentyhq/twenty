import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

// Best-effort: the status is cosmetic and auto-expires, so failures never
// block the run
export const setSlackAssistantStatus = async ({
  slackChannelId,
  threadTimestamp,
  status,
}: {
  slackChannelId: string;
  threadTimestamp: string;
  status: string;
}): Promise<void> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return;
  }

  await slackClientResult.client.assistant.threads
    .setStatus({
      channel_id: slackChannelId,
      thread_ts: threadTimestamp,
      status,
    })
    .then(
      () => undefined,
      () => undefined,
    );
};
