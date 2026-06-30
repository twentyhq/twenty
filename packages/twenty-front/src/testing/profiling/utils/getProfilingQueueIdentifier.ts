export const getProfilingQueueIdentifier = (
  profilingId: string,
  testIndex: number,
  runName: string,
) => `${profilingId}-run[${runName}]-test[${testIndex}]`;
