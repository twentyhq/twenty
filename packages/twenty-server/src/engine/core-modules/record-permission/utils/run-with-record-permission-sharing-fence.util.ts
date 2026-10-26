import { setTimeout as delay } from 'node:timers/promises';

import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

const MAX_FENCE_ATTEMPTS = 9;
const FENCE_RETRY_DELAY_MS = 25;

export const runWithRecordPermissionSharingFence = async <
  TTransaction extends Pick<WorkspaceTransactionScope, 'executeRawQuery'>,
>({
  schemaName,
  runInTransaction,
  work,
}: {
  schemaName: string;
  runInTransaction: (
    work: (transaction: TTransaction) => Promise<void>,
  ) => Promise<void>;
  work: (transaction: TTransaction) => Promise<void>;
}): Promise<void> => {
  for (let attempt = 0; attempt < MAX_FENCE_ATTEMPTS; attempt++) {
    let acquired = false;

    await runInTransaction(async (transaction) => {
      const [result] = await transaction.executeRawQuery(
        'SELECT pg_try_advisory_xact_lock(hashtextextended($1, 0)) AS acquired',
        [schemaName + ':record-permissions'],
      );
      acquired = result?.acquired === true;
      if (acquired) await work(transaction);
    });

    if (acquired) return;

    // Wait outside the transaction and pool slot; only contention before any write is retried.
    if (attempt < MAX_FENCE_ATTEMPTS - 1) await delay(FENCE_RETRY_DELAY_MS);
  }

  throw new TwentyOrmException(
    'Record sharing is temporarily busy applying permission changes',
    TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
  );
};
