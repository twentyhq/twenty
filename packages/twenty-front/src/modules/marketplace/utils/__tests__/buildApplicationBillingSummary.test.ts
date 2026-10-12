import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';

describe('buildApplicationBillingSummary', () => {
  it('asks consent to bill credits with the app pricing during installation', () => {
    expect(
      buildApplicationBillingSummary({
        billsCredits: true,
        pricingDescription: '$0.02 per minute recorded',
      }).map(({ label }) => label),
    ).toEqual(['Bill credits to your workspace ($0.02 per minute recorded)']);
  });

  it('asks consent to bill credits for an app without a pricing line', () => {
    expect(
      buildApplicationBillingSummary({ billsCredits: true }).map(
        ({ label }) => label,
      ),
    ).toEqual(['Bill credits to your workspace']);
  });

  it('asks nothing for an app that bills no credits', () => {
    expect(
      buildApplicationBillingSummary({
        billsCredits: false,
        pricingDescription: 'Free',
      }),
    ).toEqual([]);
  });
});
