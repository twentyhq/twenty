import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/metadata-modules/ai/ai-billing/constants/dollar-to-credit-multiplier';

export const convertDollarsToBillingCredits = (dollars: number): number =>
  dollars * DOLLAR_TO_CREDIT_MULTIPLIER;
