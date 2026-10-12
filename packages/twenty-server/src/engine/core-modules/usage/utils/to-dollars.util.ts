import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/metadata-modules/ai/ai-billing/constants/dollar-to-credit-multiplier';

export const toDollars = (internalCredits: number): number =>
  Math.round((internalCredits / DOLLAR_TO_CREDIT_MULTIPLIER) * 100) / 100;
