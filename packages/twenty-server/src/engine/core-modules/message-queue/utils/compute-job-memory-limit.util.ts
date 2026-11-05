export const computeJobMemoryCapacityBytes = ({
  maxMemoryBytes,
  reserve,
}: {
  maxMemoryBytes: number;
  reserve: number;
}): number => Math.floor(maxMemoryBytes * (1 - reserve));

// A group key may use `share` of the memory every other key leaves free, so n saturated
// keys each hold share / (1 + share * (n - 1)) of the capacity and never fill it
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

export const computeJobMemoryAvailableBytes = (
  groupKeys: { usedBytes: number; limitBytes: number }[],
): number | null =>
  groupKeys.length === 0
    ? null
    : Math.max(
        0,
        Math.min(
          ...groupKeys.map(
            ({ usedBytes, limitBytes }) => limitBytes - usedBytes,
          ),
        ),
      );
