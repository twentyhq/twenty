// Slack message timestamps double as record lookup keys on the live test
// server. The per-suite prefix keeps suites apart, and the run's start time -
// its second in the leading half, its millisecond in the trailing one - keeps
// runs apart, so a rerun against a database that still holds an earlier run's
// records cannot match them.
export const createSlackMessageTimestampSequence = (
  suitePrefix: string,
): (() => string) => {
  const startedAt = String(Date.now());
  const runSecond = startedAt.slice(-6, -3);
  const runMillisecond = startedAt.slice(-3);

  let sequence = 0;

  return () => {
    sequence += 1;

    return `${suitePrefix}${runSecond}.${runMillisecond}${String(
      sequence,
    ).padStart(3, '0')}`;
  };
};
