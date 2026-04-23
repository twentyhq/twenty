import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/metadata-modules/ai/ai-billing/constants/dollar-to-credit-multiplier';

// Converts internal micro-credits to dollars.
// Rounds to 2 decimal places (e.g. 7500 → 0.01).
export const toDollars = (internalCredits: number): number =>
  Math.round((internalCredits / DOLLAR_TO_CREDIT_MULTIPLIER) * 100) / 100;
