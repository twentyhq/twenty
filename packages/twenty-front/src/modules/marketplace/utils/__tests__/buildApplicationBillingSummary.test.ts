import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';

describe('buildApplicationBillingSummary', () => {
  it('asks consent to bill credits during installation', () => {
    expect(
      buildApplicationBillingSummary(true).map(({ label }) => label),
    ).toEqual(['Bill credits to your workspace']);
  });

  it('asks nothing for an app that bills no credits', () => {
    expect(buildApplicationBillingSummary(false)).toEqual([]);
  });
});
