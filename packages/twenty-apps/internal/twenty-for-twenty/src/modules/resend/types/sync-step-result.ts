import type { SyncResult } from 'src/modules/resend/types/sync-result';

export type SyncStepResult<TValue = undefined> = {
  result: SyncResult;
  value: TValue;
};
