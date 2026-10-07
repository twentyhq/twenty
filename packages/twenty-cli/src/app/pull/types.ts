import { type SkippedPullEntity } from '@/app/pull/build-pull-entities';
import { type PullDeletion, type PullWrite } from '@/app/pull/plan-pull-writes';
import { type AppExport } from '@/app/types/app-export.type';
import { type PullTarget } from '@/app/types/pull-target.type';

export type PullAppOptions = {
  appPath: string;
  applicationExport: AppExport;
  target: PullTarget;
  signal: AbortSignal;
};

export type PullBaseStatus =
  | 'used'
  | 'missing'
  | 'other-target'
  | 'unbound'
  | 'unreadable';

export type PullAppResult = {
  application: { universalIdentifier: string; displayName: string };
  base: { status: PullBaseStatus };
  writes: Omit<PullWrite, 'content' | 'requiredSdkExports'>[];
  deletions: PullDeletion[];
  overwrittenLocalChanges: PullDeletion[];
  unchangedCount: number;
  localOnlyRelativePaths: string[];
  unreadableRelativePaths: string[];
  skipped: SkippedPullEntity[];
  compiledTranslationEntryCountByLocale: Record<string, number>;
  entityLabelByUniversalIdentifier: Record<string, string>;
};
