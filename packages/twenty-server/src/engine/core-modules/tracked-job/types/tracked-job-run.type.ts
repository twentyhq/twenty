import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type TrackedJobPageQuery } from 'src/engine/core-modules/tracked-job/types/tracked-job-page-query.type';
import { type TrackedJobPage } from 'src/engine/core-modules/tracked-job/types/tracked-job-page.type';

export type TrackedJobRun<TProgress> = {
  requester: UserWorkspaceAuthContext;
  signal: AbortSignal;
  reportProgress: (progress: TProgress) => Promise<void>;
  readPages: (query: TrackedJobPageQuery) => AsyncGenerator<TrackedJobPage>;
};
