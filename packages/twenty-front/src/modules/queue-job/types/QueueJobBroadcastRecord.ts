import { type JobState } from '~/generated-metadata/graphql';

export type QueueJobBroadcastRecord = {
  id: string;
  name: string;
  state: JobState;
  attemptsMade: number;
  failedReason: string | null;
  enqueuedAt: number;
  startedAt: number | null;
  finishedAt: number | null;
};
