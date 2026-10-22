import { findNextBillingPhase } from '@/settings/billing/utils/findNextBillingPhase';

const NOW_IN_SECONDS = 1_800_000_000;
const NOW_IN_MILLISECONDS = NOW_IN_SECONDS * 1000;
const DAY_IN_SECONDS = 86_400;

const pastPhase = {
  start_date: NOW_IN_SECONDS - 30 * DAY_IN_SECONDS,
  end_date: NOW_IN_SECONDS + DAY_IN_SECONDS,
};
const nextPhase = {
  start_date: NOW_IN_SECONDS + DAY_IN_SECONDS,
  end_date: NOW_IN_SECONDS + 31 * DAY_IN_SECONDS,
};
const laterPhase = {
  start_date: NOW_IN_SECONDS + 31 * DAY_IN_SECONDS,
  end_date: NOW_IN_SECONDS + 61 * DAY_IN_SECONDS,
};

describe('findNextBillingPhase', () => {
  it('returns the phase that starts after the current one', () => {
    expect(
      findNextBillingPhase([pastPhase, nextPhase], NOW_IN_MILLISECONDS),
    ).toBe(nextPhase);
  });

  it('returns the earliest upcoming phase whatever the order', () => {
    expect(
      findNextBillingPhase(
        [laterPhase, pastPhase, nextPhase],
        NOW_IN_MILLISECONDS,
      ),
    ).toBe(nextPhase);
  });

  it('returns undefined once the last phase has started', () => {
    const currentPhase = {
      start_date: NOW_IN_SECONDS - DAY_IN_SECONDS,
      end_date: NOW_IN_SECONDS + 29 * DAY_IN_SECONDS,
    };

    expect(
      findNextBillingPhase([pastPhase, currentPhase], NOW_IN_MILLISECONDS),
    ).toBeUndefined();
  });

  it('returns undefined without phases', () => {
    expect(findNextBillingPhase([], NOW_IN_MILLISECONDS)).toBeUndefined();
  });
});
