import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/metadata-modules/ai/ai-billing/constants/dollar-to-credit-multiplier';

// Converts cost in cents to cost in credits
// Formula: credits = (cents / 100) * DOLLAR_TO_CREDIT_MULTIPLIER
// Where DOLLAR_TO_CREDIT_MULTIPLIER = 1_000_000 (so $0.000_001 = 1 credit)
// Example: 1 cent = (1 / 100) * 1_000_000 = 10_000 credits
export const convertCentsToBillingCredits = (cents: number): number =>
  (cents / 100) * DOLLAR_TO_CREDIT_MULTIPLIER;
