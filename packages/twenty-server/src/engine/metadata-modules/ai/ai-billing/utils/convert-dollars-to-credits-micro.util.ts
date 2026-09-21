import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/metadata-modules/ai/ai-billing/constants/dollar-to-credit-multiplier';

export const convertDollarsToCreditsMicro = (dollars: number): number =>
  Math.round(dollars * DOLLAR_TO_CREDIT_MULTIPLIER);
