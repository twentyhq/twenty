import { type BuildOperationOptions } from '@/application-build/types';
import { type SkippedPullEntity } from '@/cli/utilities/pull/build-pull-entities';
import {
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';

export type AppIdentity = {
  universalIdentifier: string;
  displayName: string | null;
};

export type ReadAppIdentityResult = { application: AppIdentity | null };

export type AppPullTarget = { apiUrl: string; workspaceId: string };

export type PullAppOptions = BuildOperationOptions & {
  applicationExport: unknown;
  target: AppPullTarget;
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
  writes: Omit<PullWrite, 'content'>[];
  deletions: PullDeletion[];
  overwrittenLocalChanges: PullDeletion[];
  unchangedCount: number;
  localOnlyRelativePaths: string[];
  unreadableRelativePaths: string[];
  skipped: SkippedPullEntity[];
  compiledTranslationEntryCountByLocale: Record<string, number>;
  entityLabelByUniversalIdentifier: Record<string, string>;
};
