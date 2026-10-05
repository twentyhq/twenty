import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';

export const enqueueFathomBackfillWorker = async ({
  connectedAccountId,
  days,
}: {
  connectedAccountId: string;
  days: number;
}): Promise<void> =>
  enqueueFathomJobsOrThrow({
    logicFunctionUniversalIdentifier:
      FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
    payloads: [{ connectedAccountId, days }],
  });
