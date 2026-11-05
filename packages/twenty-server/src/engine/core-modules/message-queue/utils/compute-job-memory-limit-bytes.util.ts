export const computeJobMemoryLimitBytes = ({
  capacityBytes,
  usedMemoryBytes,
  groupKeyUsedBytes,
  share,
}: {
  capacityBytes: number;
  usedMemoryBytes: number;
  groupKeyUsedBytes: number;
  share: number;
}): number => {
  const otherUsedBytes = usedMemoryBytes - groupKeyUsedBytes;
  const freeBytes = capacityBytes - otherUsedBytes;

  return Math.max(0, Math.floor(share * freeBytes));
};
