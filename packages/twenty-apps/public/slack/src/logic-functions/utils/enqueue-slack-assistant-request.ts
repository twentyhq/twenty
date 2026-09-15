import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { enqueueSlackAssistantRequestRecord } from 'src/logic-functions/utils/enqueue-slack-assistant-request-record';
import { gateSlackThreadFollowUp } from 'src/logic-functions/utils/gate-slack-thread-follow-up';
import { isSlackChannelSilenced } from 'src/logic-functions/utils/is-slack-channel-silenced';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';
import { replyToEmptySlackAssistantRequest } from 'src/logic-functions/utils/reply-to-empty-slack-assistant-request';

const SILENCED_CHANNEL_SKIP_REASON = 'Channel is silenced by a channel rule';

const DIRECT_MESSAGE_CHANNEL_TYPE = 'im';

// Checked before anything visible happens in Slack, so a silenced channel
// never sees a thinking status, an empty-request hint or a recorded request.
const isSilencedChannelEvent = async ({
  body,
  slackChannelId,
}: {
  body: SlackEventsRequestBody;
  slackChannelId: string;
}): Promise<boolean> =>
  body.event?.channel_type !== DIRECT_MESSAGE_CHANNEL_TYPE &&
  (await isSlackChannelSilenced({
    client: new CoreApiClient(),
    slackChannelId,
  }));

export const enqueueSlackAssistantRequest = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  const parsed = parseSlackAssistantRequest(body);

  if (parsed.request === null) {
    if (!isDefined(parsed.emptyRequest)) {
      return { ok: true, skipped: parsed.skipReason };
    }

    if (
      await isSilencedChannelEvent({
        body,
        slackChannelId: parsed.emptyRequest.slackChannelId,
      })
    ) {
      return { ok: true, skipped: SILENCED_CHANNEL_SKIP_REASON };
    }

    return await replyToEmptySlackAssistantRequest(parsed.emptyRequest);
  }

  // Before the follow-up gate: an expired thread would otherwise be nudged.
  if (
    await isSilencedChannelEvent({
      body,
      slackChannelId: parsed.request.slackChannelId,
    })
  ) {
    return { ok: true, skipped: SILENCED_CHANNEL_SKIP_REASON };
  }

  if (parsed.requiresActiveThreadSubscription) {
    const followUpGateResult = await gateSlackThreadFollowUp(parsed.request);

    if (isDefined(followUpGateResult)) {
      return followUpGateResult;
    }
  }

  return await enqueueSlackAssistantRequestRecord(parsed.request);
};
