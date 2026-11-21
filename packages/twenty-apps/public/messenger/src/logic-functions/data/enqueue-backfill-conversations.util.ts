import { MESSENGER_LOGIC_FUNCTION_BACKFILL_CONVERSATIONS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { type BackfillConversationsPayload } from 'src/logic-functions/types/conversations-api.type';

export const enqueueBackfillConversations = ({
  payload,
  delayMs,
}: {
  payload: BackfillConversationsPayload;
  delayMs?: number;
}) =>
  enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      MESSENGER_LOGIC_FUNCTION_BACKFILL_CONVERSATIONS_UNIVERSAL_IDENTIFIER,
    payloads: [payload],
    getJobKey: ({ pageId, backfillRunId, after }) =>
      `${backfillRunId}:${pageId}:${after ?? 'first'}`,
    delayMs,
  });
