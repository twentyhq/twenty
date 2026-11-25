import type Stripe from 'stripe';

import { type AdminPanelBillingCouponDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-billing-coupon.dto';

export const fromStripeCouponToDto = (
  coupon: Stripe.Coupon,
): AdminPanelBillingCouponDTO => ({
  id: coupon.id,
  name: coupon.name,
  percentOff: coupon.percent_off,
  amountOff: coupon.amount_off,
  currency: coupon.currency,
  duration: coupon.duration,
  durationInMonths: coupon.duration_in_months,
});
