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
