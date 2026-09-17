import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE } from 'src/engine/core-modules/usage-limit/constants/usage-spender-column-by-spender-type.constant';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';

const spenderColumnMatches = (
  rowValue: string,
  spenderId: string | null,
): boolean =>
  isDefined(spenderId) ? rowValue === spenderId : isNonEmptyString(rowValue);

export type QuotaConsumptionScope = Pick<
  LimitQuotaCounter,
  'operationType' | 'spenderType' | 'spenderId' | 'meter'
>;

const rowMatchesScope = (
  row: UsageConsumptionRow,
  scope: QuotaConsumptionScope,
): boolean => {
  if (
    scope.operationType !== UsageOperationType.ALL &&
    row.operationType !== scope.operationType
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
    .reduce((total, row) => total + Number(row[scope.meter]), 0);
