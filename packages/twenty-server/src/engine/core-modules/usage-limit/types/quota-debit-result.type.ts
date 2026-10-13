import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';

export type QuotaDebitResult = {
  exhaustedKind: ExhaustedKind | null;
  memberCreditsUsedMicro: number;
  isMemberAllowanceExhausted: boolean;
  memberAllowancePeriodEnd: Date | null;
};
