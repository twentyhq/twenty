// The consume script answers [existed, remaining] pairs, one per counter key;
// a counter that did not exist was not debited and stays cold (null).
export const fromConsumeResultsToRemainings = (
  consumeResults: number[],
): (number | null)[] =>
  Array.from({ length: consumeResults.length / 2 }, (_, index) =>
    consumeResults[2 * index] === 1 ? consumeResults[2 * index + 1] : null,
  );
