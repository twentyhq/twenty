/**
 * @description
 * - ONE_TIME: One time charge, used for one time payments in every subscription
 * - PER_SEAT: Per seat charge, used for subscriptions that ad up for every new workspace member
 * - PRE_PAID: Pre paid charge, used for pre paid subscriptions
 */
export enum ChargeType {
  ONE_TIME = 'one_time',
  PER_SEAT = 'per_seat',
  PRE_PAID = 'pre_paid',
}
