import { getCoreObjectRunInsightsHasRuns } from '@/object-core/utils/getCoreObjectRunInsightsHasRuns';

describe('getCoreObjectRunInsightsHasRuns', () => {
  it('is unknown while the first response is loading', () => {
    expect(
      getCoreObjectRunInsightsHasRuns({ isLoading: true, runCount: undefined }),
    ).toBeUndefined();
  });

  it('uses a known run count even while refreshing', () => {
    expect(
      getCoreObjectRunInsightsHasRuns({ isLoading: true, runCount: 3 }),
    ).toBe(true);
  });

  it('has no runs when the count is zero or never loaded', () => {
    expect(
      getCoreObjectRunInsightsHasRuns({ isLoading: false, runCount: 0 }),
    ).toBe(false);
    expect(
      getCoreObjectRunInsightsHasRuns({
        isLoading: false,
        runCount: undefined,
      }),
    ).toBe(false);
  });
});
