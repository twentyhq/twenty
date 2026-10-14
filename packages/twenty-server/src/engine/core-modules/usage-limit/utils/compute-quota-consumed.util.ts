import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE } from 'src/engine/core-modules/usage-limit/constants/usage-spender-column-by-spender-type.constant';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { computeRowConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-row-consumed.util';
import { isOperationInScope } from 'src/engine/core-modules/usage-limit/utils/is-operation-in-scope.util';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';

const spenderColumnMatches = (
  rowValue: string,
  spenderId: string | null,
): boolean =>
  isDefined(spenderId) ? rowValue === spenderId : isNonEmptyString(rowValue);

export type QuotaConsumptionScope = Pick<
  LimitQuotaCounter,
  'operationTypes' | 'spenderType' | 'spenderId' | 'unit'
>;

const rowMatchesScope = (
  row: UsageConsumptionRow,
  scope: QuotaConsumptionScope,
): boolean => {
  if (
    !isOperationInScope({
      operationTypes: scope.operationTypes,
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

export const computeQuotaConsumed = ({
  rows,
  scope,
}: {
  rows: UsageConsumptionRow[];
  scope: QuotaConsumptionScope;
}): number =>
  rows
    .filter((row) => rowMatchesScope(row, scope))
    .reduce((total, row) => total + computeRowConsumed({ row, scope }), 0);
