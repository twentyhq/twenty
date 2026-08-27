const TIMESTAMP_PART_COUNT = 3;

export const parseFathomTimestamp = (timestamp: string): number | undefined => {
  const timestampParts = timestamp.split(':').map(Number);

  if (
    timestampParts.length !== TIMESTAMP_PART_COUNT ||
    timestampParts.some((timestampPart) => !Number.isFinite(timestampPart))
  ) {
    return undefined;
  }

  const [hours, minutes, seconds] = timestampParts;

  return hours * 3600 + minutes * 60 + seconds;
};
