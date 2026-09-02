import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueFathomJobOrThrow } from 'src/logic-functions/utils/enqueue-fathom-job-or-throw.util';

export const enqueueFathomBackfillWorker = async ({
  connectedAccountId,
  days,
}: {
  connectedAccountId: string;
  days: number;
}): Promise<void> =>
  enqueueFathomJobOrThrow({
    logicFunctionUniversalIdentifier:
      FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
    payload: { connectedAccountId, days },
  });
