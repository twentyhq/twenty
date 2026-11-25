export const computeJobMemoryCapacityBytes = ({
  maxMemoryBytes,
  reserve,
}: {
  maxMemoryBytes: number;
  reserve: number;
}): number => Math.floor(maxMemoryBytes * (1 - reserve));
