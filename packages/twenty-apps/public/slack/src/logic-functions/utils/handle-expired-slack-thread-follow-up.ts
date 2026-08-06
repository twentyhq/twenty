import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { clearLapsedSlackThreadSubscription } from 'src/logic-functions/utils/clear-lapsed-slack-thread-subscription';
import { nudgeExpiredSlackThread } from 'src/logic-functions/utils/nudge-expired-slack-thread';

export const handleExpiredSlackThreadFollowUp = async ({
  channelId,
  threadTimestamp,
  slackUserId,
}: SlackThreadReference & {
  slackUserId: string;
}): Promise<SlackEventsEnqueueResult> => {
  const nudgeResult = await nudgeExpiredSlackThread({
    channelId,
    threadTimestamp,
    slackUserId,
  });

  if (nudgeResult.success) {
    await clearLapsedSlackThreadSubscription({ channelId, threadTimestamp });
  }

  return {
    ok: true,
    skipped: nudgeResult.success
      ? 'Thread subscription expired; nudged the requester'
      : 'Thread subscription expired; the nudge could not be posted',
  };
};
