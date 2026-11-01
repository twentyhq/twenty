import { FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomBackfillBatchPayload } from 'src/logic-functions/types/fathom-backfill-batch-payload.type';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';
import { reserveFathomImportSlots } from 'src/logic-functions/utils/reserve-fathom-import-slots.util';

export const enqueueFathomBackfillBatch = async ({
  notBeforeDelayMilliseconds,
  ...payload
}: FathomBackfillBatchPayload & {
  notBeforeDelayMilliseconds?: number;
}): Promise<void> => {
  const { slotDelays } = await reserveFathomImportSlots({
    connectedAccountId: payload.connectedAccountId,
    slotCount: 1,
    notBeforeDelayMilliseconds,
  });

  await enqueueFathomJobsOrThrow({
    logicFunctionUniversalIdentifier:
      FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
    payloads: [payload],
    delayMs: slotDelays[0],
  });
};
