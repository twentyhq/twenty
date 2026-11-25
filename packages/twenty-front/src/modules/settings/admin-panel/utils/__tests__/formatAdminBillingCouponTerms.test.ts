import { formatAdminBillingCouponTerms } from '@/settings/admin-panel/utils/formatAdminBillingCouponTerms';

const coupon = {
  percentOff: null,
  amountOff: null,
  currency: null,
  duration: 'forever',
  durationInMonths: null,
};

describe('formatAdminBillingCouponTerms', () => {
  it('shows a percentage off forever', () => {
    expect(formatAdminBillingCouponTerms({ ...coupon, percentOff: 25 })).toBe(
      '25% off forever',
    );
  });

  it('shows a percentage off for a number of months', () => {
    expect(
      formatAdminBillingCouponTerms({
        ...coupon,
        percentOff: 100,
        duration: 'repeating',
        durationInMonths: 3,
      }),
    ).toBe('100% off for 3 months');
  });

  it('shows a fixed amount off once', () => {
    expect(
      formatAdminBillingCouponTerms({
        ...coupon,
        amountOff: 28800,
        currency: 'usd',
        duration: 'once',
      }),
    ).toBe('288.00 USD off once');
  });
});
