import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-assistant-request-draft.type';
import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { getSlackThreadSubscriptionState } from 'src/logic-functions/utils/get-slack-thread-subscription-state';
import { handleExpiredSlackThreadFollowUp } from 'src/logic-functions/utils/handle-expired-slack-thread-follow-up';

export const gateSlackThreadFollowUp = async (
  request: SlackAssistantRequestDraft,
): Promise<SlackEventsEnqueueResult | undefined> => {
  const threadReference = {
    channelId: request.slackChannelId,
    threadTimestamp: request.slackThreadTimestamp,
  };

  const subscriptionState =
    await getSlackThreadSubscriptionState(threadReference);

  if (subscriptionState === 'expired') {
    return await handleExpiredSlackThreadFollowUp({
      ...threadReference,
      slackUserId: request.slackUserId,
    });
  }

  if (subscriptionState === 'none') {
    return {
      ok: true,
      skipped: 'Thread is not subscribed for unmentioned follow-ups',
    };
  }

  return undefined;
};
