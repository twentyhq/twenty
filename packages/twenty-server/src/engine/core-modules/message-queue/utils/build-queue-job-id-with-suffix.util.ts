export const buildQueueJobIdWithSuffix = ({
  jobIdPrefix,
  suffix,
}: {
  jobIdPrefix: string;
  suffix: string;
}): string => `${jobIdPrefix}-${suffix}`;
