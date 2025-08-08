/**
 * Converts cost in cents to cost in credits
 * Formula: credits = cents / 100 * 1000 = cents * 10
 * @param cents - Cost in cents (real cost)
 * @returns Cost in credits (end-user cost)
 */
export const convertCentsToBillingCredits = (cents: number): number =>
  cents * 10;
