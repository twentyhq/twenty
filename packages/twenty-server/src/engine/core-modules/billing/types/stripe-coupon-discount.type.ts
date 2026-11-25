/* @license Enterprise */

export type StripeCouponDiscount = {
  stripeDiscountId: string;
  stripeCouponId: string;
  startsAt: Date;
  endsAt: Date | null;
};
