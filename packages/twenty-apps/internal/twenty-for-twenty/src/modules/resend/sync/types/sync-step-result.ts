import type { SyncResult } from 'src/modules/resend/sync/types/sync-result';

export type SyncStepResult<TValue = undefined> = {
  result: SyncResult;
  value: TValue;
};
