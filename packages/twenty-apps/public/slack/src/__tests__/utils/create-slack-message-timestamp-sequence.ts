// Slack message timestamps double as record lookup keys on the live test
// server; the per-suite prefix and the current time keep suites and runs
// from colliding with each other's records.
export const createSlackMessageTimestampSequence = (
  suitePrefix: string,
): (() => string) => {
  let sequence = 0;

  return () => {
    sequence += 1;

    return `${suitePrefix}${String(Date.now()).slice(-3)}.${String(
      sequence,
    ).padStart(6, '0')}`;
  };
};
