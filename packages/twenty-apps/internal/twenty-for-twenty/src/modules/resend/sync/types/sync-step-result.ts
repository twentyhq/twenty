import type { SyncResult } from '@modules/resend/sync/types/sync-result';

export type SyncStepResult<TValue = undefined> = {
  result: SyncResult;
  value: TValue;
};
