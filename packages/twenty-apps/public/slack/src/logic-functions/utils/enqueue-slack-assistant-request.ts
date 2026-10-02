import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { enqueueSlackAssistantRequestRecord } from 'src/logic-functions/utils/enqueue-slack-assistant-request-record';
import { gateSlackThreadFollowUp } from 'src/logic-functions/utils/gate-slack-thread-follow-up';
import { isSlackChannelSilenced } from 'src/logic-functions/utils/is-slack-channel-silenced';
import { notifySilencedSlackChannel } from 'src/logic-functions/utils/notify-silenced-slack-channel';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';
import { replyToEmptySlackAssistantRequest } from 'src/logic-functions/utils/reply-to-empty-slack-assistant-request';

const SILENCED_CHANNEL_SKIP_REASON = 'Channel is silenced by a channel rule';

const DIRECT_MESSAGE_CHANNEL_TYPE = 'im';

const gateSilencedChannelEvent = async ({
  body,
  slackChannelId,
  shouldNotifyRequester,
}: {
  body: SlackEventsRequestBody;
  slackChannelId: string;
  shouldNotifyRequester: boolean;
}): Promise<SlackEventsEnqueueResult | undefined> => {
  if (body.event?.channel_type === DIRECT_MESSAGE_CHANNEL_TYPE) {
    return undefined;
  }

  const isSilenced = await isSlackChannelSilenced({
    client: new CoreApiClient(),
    slackChannelId,
  });

  if (!isSilenced) {
    return undefined;
  }

  const slackUserId = body.event?.user;

  if (shouldNotifyRequester && isNonEmptyString(slackUserId)) {
    await notifySilencedSlackChannel({
      slackChannelId,
      slackUserId,
      parentMessageTimestamp: body.event?.thread_ts,
    });
  }

  return { ok: true, skipped: SILENCED_CHANNEL_SKIP_REASON };
};

export const enqueueSlackAssistantRequest = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  const parsed = parseSlackAssistantRequest(body);

  if (parsed.request === null) {
    if (!isDefined(parsed.emptyRequest)) {
      return { ok: true, skipped: parsed.skipReason };
    }

    const silencedEmptyRequestResult = await gateSilencedChannelEvent({
      body,
      slackChannelId: parsed.emptyRequest.slackChannelId,
      shouldNotifyRequester: true,
    });

    if (isDefined(silencedEmptyRequestResult)) {
      return silencedEmptyRequestResult;
    }

    return await replyToEmptySlackAssistantRequest(parsed.emptyRequest);
  }

  const silencedRequestResult = await gateSilencedChannelEvent({
    body,
    slackChannelId: parsed.request.slackChannelId,
    shouldNotifyRequester: !parsed.requiresActiveThreadSubscription,
  });

  if (isDefined(silencedRequestResult)) {
    return silencedRequestResult;
  }

  if (parsed.requiresActiveThreadSubscription) {
    const followUpGateResult = await gateSlackThreadFollowUp(parsed.request);

    if (isDefined(followUpGateResult)) {
      return followUpGateResult;
    }
  }

  return await enqueueSlackAssistantRequestRecord(parsed.request);
};
