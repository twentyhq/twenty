import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';

export type StepDebitResult = {
  hasNoMoreAvailableCredits: boolean;
  stopReason: Exclude<ExhaustedKind, 'limit'> | null;
  userCreditsUsedMicro: number;
  isUserAllowanceExhausted: boolean;
  userAllowancePeriodEnd: Date | null;
};
