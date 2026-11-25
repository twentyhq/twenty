import { plural, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AdminBillingCoupon } from '@/settings/admin-panel/types/AdminBillingCoupon';

const formatCouponAmount = (
  coupon: Pick<AdminBillingCoupon, 'percentOff' | 'amountOff' | 'currency'>,
): string | null => {
  if (isDefined(coupon.percentOff)) {
    return t`${coupon.percentOff}% off`;
  }

  if (isDefined(coupon.amountOff)) {
    const amount = (coupon.amountOff / 100).toFixed(2);
    const currency = coupon.currency?.toUpperCase() ?? '';

    return t`${amount} ${currency} off`;
  }

  return null;
};

const formatCouponDuration = (
  coupon: Pick<AdminBillingCoupon, 'duration' | 'durationInMonths'>,
): string => {
  if (coupon.duration === 'forever') {
    return t`forever`;
  }

  if (coupon.duration === 'once') {
    return t`once`;
  }

  const months = coupon.durationInMonths ?? 0;

  return plural(months, {
    one: `for ${months} month`,
    other: `for ${months} months`,
  });
};

export const formatAdminBillingCouponTerms = (
  coupon: Pick<
    AdminBillingCoupon,
    'percentOff' | 'amountOff' | 'currency' | 'duration' | 'durationInMonths'
  >,
): string => {
  const amount = formatCouponAmount(coupon);
  const duration = formatCouponDuration(coupon);

  return isDefined(amount) ? `${amount} ${duration}` : duration;
};
