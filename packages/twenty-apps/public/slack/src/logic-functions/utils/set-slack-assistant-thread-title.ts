import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

export const setSlackAssistantThreadTitle = async ({
  slackChannelId,
  threadTimestamp,
  title,
}: {
  slackChannelId: string;
  threadTimestamp: string;
  title: string;
}): Promise<void> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return;
  }

  await slackClientResult.client.assistant.threads
    .setTitle({
      channel_id: slackChannelId,
      thread_ts: threadTimestamp,
      title,
    })
    .then(
      () => undefined,
      () => undefined,
    );
};
