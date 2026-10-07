import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE } from 'src/engine/core-modules/usage-limit/constants/usage-spender-column-by-spender-type.constant';
import { doesOperationTypeMatchScope } from 'src/engine/core-modules/usage-limit/utils/does-operation-type-match-scope.util';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';

const spenderColumnMatches = (
  rowValue: string,
  spenderId: string | null,
): boolean =>
  isDefined(spenderId) ? rowValue === spenderId : isNonEmptyString(rowValue);

export type QuotaConsumptionScope = Pick<
  LimitQuotaCounter,
  'operationType' | 'spenderType' | 'spenderId' | 'unit'
>;

const rowMatchesScope = (
  row: UsageConsumptionRow,
  scope: QuotaConsumptionScope,
): boolean => {
  if (
    !doesOperationTypeMatchScope({
      scopeOperationType: scope.operationType,
      operationType: row.operationType,
    })
  ) {
    return false;
  }

  if (scope.spenderType === 'workspace') {
    return true;
  }

  return spenderColumnMatches(
    row[USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE[scope.spenderType]],
    scope.spenderId,
  );
};

const computeRowConsumed = (
  row: UsageConsumptionRow,
  unit: UsageUnit,
): number => {
  if (unit === UsageUnit.CREDIT) {
    return Number(row.creditsUsedMicro);
  }

  return row.unit === unit ? Number(row.quantity) : 0;
};

export const computeQuotaConsumed = ({
  rows,
  scope,
}: {
  rows: UsageConsumptionRow[];
  scope: QuotaConsumptionScope;
}): number =>
  rows
    .filter((row) => rowMatchesScope(row, scope))
    .reduce((total, row) => total + computeRowConsumed(row, scope.unit), 0);
