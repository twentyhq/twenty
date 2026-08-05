import { CoreApiClient } from 'twenty-client-sdk/core';

import { createSlackAssistantRequest } from 'src/logic-functions/data/create-slack-assistant-request';
import { findSlackAssistantRequestBySlackMessage } from 'src/logic-functions/data/find-slack-assistant-request-by-slack-message';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { clearSlackThreadSubscription } from 'src/logic-functions/utils/clear-slack-thread-subscription';
import { getSlackThreadSubscriptionState } from 'src/logic-functions/utils/get-slack-thread-subscription-state';
import { isDuplicateRecordError } from 'src/logic-functions/utils/is-duplicate-record-error';
import { nudgeExpiredSlackThread } from 'src/logic-functions/utils/nudge-expired-slack-thread';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';
import { replyToEmptySlackAssistantRequest } from 'src/logic-functions/utils/reply-to-empty-slack-assistant-request';

const ALREADY_QUEUED_SKIP_REASON = 'Slack message is already queued';

type SlackEventsEnqueueResult = { ok: boolean; skipped?: string };

export const enqueueSlackAssistantRequest = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  const parsed = parseSlackAssistantRequest(body);

  if (parsed.request === null) {
    if (parsed.emptyRequest !== undefined) {
      return await replyToEmptySlackAssistantRequest(parsed.emptyRequest);
    }

    return { ok: true, skipped: parsed.skipReason };
  }

  if (parsed.requiresActiveThreadSubscription) {
    const subscriptionState = await getSlackThreadSubscriptionState({
      channelId: parsed.request.slackChannelId,
      threadTimestamp: parsed.request.slackThreadTimestamp,
    });

    if (subscriptionState === 'expired') {
      const nudgeResult = await nudgeExpiredSlackThread({
        slackChannelId: parsed.request.slackChannelId,
        slackUserId: parsed.request.slackUserId,
        threadTimestamp: parsed.request.slackThreadTimestamp,
      });

      if (nudgeResult.success) {
        await clearSlackThreadSubscription({
          channelId: parsed.request.slackChannelId,
          threadTimestamp: parsed.request.slackThreadTimestamp,
        });
      }

      return {
        ok: true,
        skipped: nudgeResult.success
          ? 'Thread subscription expired; nudged the requester'
          : 'Thread subscription expired; the nudge could not be posted',
      };
    }

    if (subscriptionState === 'none') {
      return {
        ok: true,
        skipped: 'Thread is not subscribed for unmentioned follow-ups',
      };
    }
  }

  const client = new CoreApiClient();

  const existingRequestId = await findSlackAssistantRequestBySlackMessage(
    client,
    {
      slackChannelId: parsed.request.slackChannelId,
      slackMessageTimestamp: parsed.request.slackMessageTimestamp,
    },
  );

  if (existingRequestId !== undefined) {
    return { ok: true, skipped: ALREADY_QUEUED_SKIP_REASON };
  }

  try {
    await createSlackAssistantRequest(client, parsed.request);
  } catch (error) {
    if (isDuplicateRecordError(error)) {
      return { ok: true, skipped: ALREADY_QUEUED_SKIP_REASON };
    }

    throw error;
  }

  return { ok: true };
};
