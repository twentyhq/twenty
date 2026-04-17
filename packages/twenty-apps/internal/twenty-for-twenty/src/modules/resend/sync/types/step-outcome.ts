import type { SyncResult } from 'src/modules/resend/sync/types/sync-result';

export type StepOutcome<TValue = undefined> =
  | {
      name: string;
      status: 'ok';
      durationMs: number;
      result: SyncResult;
      value: TValue;
    }
  | {
      name: string;
      status: 'failed';
      durationMs: number;
      error: string;
    }
  | {
      name: string;
      status: 'skipped';
      reason: string;
    };
