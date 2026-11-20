import { enqueueJobs } from 'twenty-sdk/logic-function';
import { ENQUEUE_JOBS_MAX_BATCH_SIZE } from 'src/constants/enqueue-jobs-max-batch-size.constant';
import { WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type ParseMessagePayload } from 'src/logic-functions/types/parse-message-payload.type';

// a single history webhook can describe thousands of messages
export const enqueueParseMessageJobs = async (payloads: ParseMessagePayload[]) => {
  for (let start = 0; start < payloads.length; start += ENQUEUE_JOBS_MAX_BATCH_SIZE) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
      retryLimit: 3,
      delayMs: 500,
      jobs: payloads
        .slice(start, start + ENQUEUE_JOBS_MAX_BATCH_SIZE)
        .map((payload) => ({ payload })),
    });
  }
};
