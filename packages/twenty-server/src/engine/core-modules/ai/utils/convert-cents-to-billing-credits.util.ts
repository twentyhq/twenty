import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/core-modules/ai/constants/dollar-to-credit-multiplier';

/**
 * Converts cost in cents to cost in credits
 * Formula: credits = (cents / 100) * DOLLAR_TO_CREDIT_MULTIPLIER
 * Where DOLLAR_TO_CREDIT_MULTIPLIER = 1000000 ($0.00001 = 1 credit)
 * Simplified: cents * 10000
 * @param cents - Cost in cents (real cost)
 * @returns Cost in credits (end-user cost)
 */
export const convertCentsToBillingCredits = (cents: number): number =>
  (cents / 100) * DOLLAR_TO_CREDIT_MULTIPLIER;
