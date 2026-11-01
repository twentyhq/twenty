import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';

export type StepDebitResult = {
  stopReason: Exclude<ExhaustedKind, 'limit'> | null;
  userCreditsUsedMicro: number;
  userAllowanceExhaustedUntil: Date | null;
};
