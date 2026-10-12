import { type WatchInputs } from '@/app/dev/types/watch-inputs.type';
import { type PullTarget } from '@/app/types/pull-target.type';

export type AppWorkerRequest =
  | { type: 'generateSourceClient'; appPath: string; schema: string }
  | { type: 'readSourceIdentity'; appPath: string }
  | { type: 'buildManifest'; appPath: string }
  | { type: 'typecheckSource'; appPath: string }
  | {
      type: 'bundleSnapshot';
      appPath: string;
      holdSnapshot: boolean;
      collectWatchInputs?: boolean;
    }
  | {
      type: 'pull';
      appPath: string;
      applicationExport: unknown;
      target: PullTarget;
    }
  | { type: 'release' }
  | { type: 'cancel' };

export type AppWorkerResponse =
  | {
      type: 'result';
      result: unknown;
      release?: unknown;
      isSnapshotHeld: boolean;
      watchInputs?: WatchInputs;
    }
  | { type: 'released'; release: unknown }
  | {
      type: 'failure';
      message: string;
      code?: string;
      hint?: string;
      details?: Record<string, unknown>;
    };
