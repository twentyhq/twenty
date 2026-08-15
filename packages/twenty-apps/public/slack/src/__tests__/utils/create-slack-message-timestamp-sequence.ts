// Slack message timestamps double as record lookup keys on the live test
// server. The whole part is the run's start second, shifted by a per-suite
// offset so two suites in one run cannot meet, and the fraction carries the
// millisecond and the message counter. Epoch seconds never wrap, so no rerun
// can reproduce an earlier run's keys.
export const createSlackMessageTimestampSequence = (
  suiteOffsetSeconds: number,
): (() => string) => {
  const startedAt = Date.now();
  const runSecond = Math.floor(startedAt / 1000) + suiteOffsetSeconds;
  const runMillisecond = String(startedAt % 1000).padStart(3, '0');

  let sequence = 0;

  return () => {
    sequence += 1;

    return `${runSecond}.${runMillisecond}${String(sequence).padStart(3, '0')}`;
  };
};
