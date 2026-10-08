import { isDefined } from 'twenty-sdk/utils';

import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { enqueueSlackAssistantRequestRecord } from 'src/logic-functions/utils/enqueue-slack-assistant-request-record';
import { gateSlackThreadFollowUp } from 'src/logic-functions/utils/gate-slack-thread-follow-up';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';
import { replyToEmptySlackAssistantRequest } from 'src/logic-functions/utils/reply-to-empty-slack-assistant-request';

export const enqueueSlackAssistantRequest = async (
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
