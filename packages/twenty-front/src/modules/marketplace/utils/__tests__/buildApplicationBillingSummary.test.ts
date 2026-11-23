import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';

describe('buildApplicationBillingSummary', () => {
  it('asks consent to bill the workspace during installation', () => {
    expect(
      buildApplicationBillingSummary(true).map(({ label }) => label),
    ).toEqual(['Bill your workspace']);
  });

  it('asks nothing for a free app', () => {
    expect(buildApplicationBillingSummary(false)).toEqual([]);
  });
});
