import { type JobState } from '~/generated-metadata/graphql';

export type QueueJobBroadcastRecord = {
  id: string;
  name: string;
  state: JobState;
  failedReason: string | null;
};
