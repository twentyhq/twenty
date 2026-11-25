import { type BillingCouponFragmentFragment } from '~/generated-admin/graphql';

export type AdminBillingCoupon = Omit<
  BillingCouponFragmentFragment,
  '__typename'
>;
