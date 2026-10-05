const FATHOM_TIMESTAMP_PATTERN = /^(\d+):([0-5]?\d):([0-5]?\d)$/;

export const parseFathomTimestamp = (timestamp: string): number | undefined => {
  const timestampMatch = FATHOM_TIMESTAMP_PATTERN.exec(timestamp);

  if (timestampMatch === null) {
    return undefined;
  }

  const [, hours, minutes, seconds] = timestampMatch.map(Number);

  return hours * 3600 + minutes * 60 + seconds;
};
