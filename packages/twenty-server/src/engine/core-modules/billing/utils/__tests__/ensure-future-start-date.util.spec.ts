import { ensureFutureStartDate } from 'src/engine/core-modules/billing/utils/ensure-future-start-date.util';

describe('ensureFutureStartDate', () => {
  const fixedNowSec = 1_700_000_000; // arbitrary fixed epoch seconds
  const fixedNowMs = fixedNowSec * 1000;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(fixedNowMs);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns now+1 when called with no arguments', () => {
    expect(ensureFutureStartDate()).toBe(fixedNowSec + 1);
  });

  it('returns now+1 when all provided dates are in the past or equal to now', () => {
    const past = fixedNowSec - 10;
    const equal = fixedNowSec;

    expect(ensureFutureStartDate(past, null, undefined, 0, equal)).toBe(
      fixedNowSec + 1,
    );
  });

  it('returns the maximum future date when at least one future date is provided', () => {
    const future1 = fixedNowSec + 5;
    const future2 = fixedNowSec + 10;

    expect(ensureFutureStartDate(future1, future2)).toBe(future2);
  });

  it('ignores null/undefined by treating them as 0 and still enforces at least now+1', () => {
    const result = ensureFutureStartDate(
      null,
      undefined,
      -100,
      fixedNowSec - 1,
    );

    expect(result).toBe(fixedNowSec + 1);
  });

  it('returns a provided future date even if it is just one second above now+1 boundary', () => {
    const barelyFuture = fixedNowSec + 2; // > now+1

    expect(ensureFutureStartDate(barelyFuture)).toBe(barelyFuture);
  });
});
