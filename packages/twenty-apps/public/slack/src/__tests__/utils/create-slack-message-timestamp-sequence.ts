const RUN_NONCE_UPPER_BOUND = 1000;

// Slack message timestamps double as record lookup keys on the live test
// server. The per-suite prefix keeps suites apart, and the millisecond plus a
// per-run nonce keep runs apart, so a rerun against a database that still
// holds an earlier run's records cannot match them.
export const createSlackMessageTimestampSequence = (
  suitePrefix: string,
): (() => string) => {
  const runNonce = String(
    Math.floor(Math.random() * RUN_NONCE_UPPER_BOUND),
  ).padStart(3, '0');

  let sequence = 0;

  return () => {
    sequence += 1;

    return `${suitePrefix}${String(Date.now()).slice(-3)}.${runNonce}${String(
      sequence,
    ).padStart(3, '0')}`;
  };
};
