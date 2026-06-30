import { getProfilingQueueIdentifier } from '~/testing/profiling/utils/getProfilingQueueIdentifier';

export const getTestArray = (
  profilingId: string,
  numberOfTestsPerRun: number,
  runName: string,
) => {
  const testArray = Array.from({ length: numberOfTestsPerRun }, (_, i) =>
    getProfilingQueueIdentifier(profilingId, i, runName),
  );

  return testArray;
};
