/* @license Enterprise */

export type StripeDiscount = {
  stripeDiscountId: string;
  startsAt: Date;
  endsAt: Date | null;
};
