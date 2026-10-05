import { defineLogicFunction } from 'twenty-sdk/define';

import { FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { firefliesBackfillBatchHandler } from 'src/logic-functions/handlers/fireflies-backfill-batch-handler';

export default defineLogicFunction({
  universalIdentifier:
    FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-backfill-batch',
  description:
    'Imports one enqueued batch of Fireflies calls into CallRecording records by transcript id.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesBackfillBatchHandler,
});
