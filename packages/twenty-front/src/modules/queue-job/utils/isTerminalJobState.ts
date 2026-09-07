import { JobState } from '~/generated-metadata/graphql';

export const isTerminalJobState = (state: JobState): boolean =>
  state === JobState.COMPLETED || state === JobState.FAILED;
