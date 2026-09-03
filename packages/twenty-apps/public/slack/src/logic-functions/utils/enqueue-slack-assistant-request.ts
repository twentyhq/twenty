import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { enqueueSlackAssistantRequestRecord } from 'src/logic-functions/utils/enqueue-slack-assistant-request-record';
import { gateSlackThreadFollowUp } from 'src/logic-functions/utils/gate-slack-thread-follow-up';
import { logDiscardedSlackEvent } from 'src/logic-functions/utils/log-discarded-slack-event';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';
import { replyToEmptySlackAssistantRequest } from 'src/logic-functions/utils/reply-to-empty-slack-assistant-request';

const resolveSlackAssistantRequestEnqueue = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  const parsed = parseSlackAssistantRequest(body);

  if (parsed.request === null) {
    if (isDefined(parsed.emptyRequest)) {
      return await replyToEmptySlackAssistantRequest(parsed.emptyRequest);
    }

    return { ok: true, skipped: parsed.skipReason };
  }

  if (parsed.requiresActiveThreadSubscription) {
    const followUpGateResult = await gateSlackThreadFollowUp(parsed.request);

    if (isDefined(followUpGateResult)) {
      return followUpGateResult;
    }
  }

  return await enqueueSlackAssistantRequestRecord(parsed.request);
};

export const enqueueSlackAssistantRequest = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  const result = await resolveSlackAssistantRequestEnqueue(body);

  // Slack only ever sees { ok: true }, so a discard is invisible to the person
  // who posted the message and to whoever has to explain why nothing happened.
  if (isNonEmptyString(result.skipped)) {
    logDiscardedSlackEvent({ body, skipReason: result.skipped });
  }

  return result;
};
