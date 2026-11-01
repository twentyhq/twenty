import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { isWorkspaceCreditLimitCounter } from 'src/engine/core-modules/usage-limit/utils/is-workspace-credit-limit-counter.util';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';

export const computeRowConsumed = ({
  row,
  scope,
}: {
  row: Pick<
    UsageConsumptionRow,
    | 'unit'
    | 'creditsUsedMicro'
    | 'userCreditsUsedMicro'
    | 'workspaceCreditsUsedMicro'
    | 'quantity'
  >;
  scope: Pick<LimitQuotaCounter, 'spenderType' | 'unit'>;
}): number => {
  if (scope.unit === UsageUnit.USER_CREDIT) {
    return Number(row.userCreditsUsedMicro);
  }

  if (isWorkspaceCreditLimitCounter(scope)) {
    return Number(row.workspaceCreditsUsedMicro);
  }

  if (scope.unit === UsageUnit.CREDIT) {
    return Number(row.creditsUsedMicro);
  }

  return row.unit === scope.unit ? Number(row.quantity) : 0;
};
