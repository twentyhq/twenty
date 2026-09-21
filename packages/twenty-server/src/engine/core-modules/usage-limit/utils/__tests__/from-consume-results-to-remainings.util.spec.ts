import { fromConsumeResultsToRemainings } from 'src/engine/core-modules/usage-limit/utils/from-consume-results-to-remainings.util';

describe('fromConsumeResultsToRemainings', () => {
  it('reads one remaining per debited counter', () => {
    expect(fromConsumeResultsToRemainings([1, 500, 1, -10])).toEqual([
      500, -10,
    ]);
  });

  it('leaves a counter the script did not find cold', () => {
    expect(fromConsumeResultsToRemainings([1, 500, 0, 0])).toEqual([500, null]);
  });

  it('answers nothing for no results', () => {
    expect(fromConsumeResultsToRemainings([])).toEqual([]);
  });
});
