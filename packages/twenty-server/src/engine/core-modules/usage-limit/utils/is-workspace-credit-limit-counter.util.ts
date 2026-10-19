import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const isWorkspaceCreditLimitCounter = (
  counter: Pick<LimitQuotaCounter, 'spenderType' | 'unit'>,
): boolean =>
  counter.spenderType === 'workspace' && counter.unit === UsageUnit.CREDIT;
