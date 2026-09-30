import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE } from 'src/engine/core-modules/usage-limit/constants/usage-spender-column-by-spender-type.constant';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { USAGE_UNIT_BY_OPERATION_TYPE } from 'src/engine/core-modules/usage/constants/usage-unit-by-operation-type.constant';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';

const unitByOperationType: Partial<Record<string, UsageUnit>> =
  USAGE_UNIT_BY_OPERATION_TYPE;

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

const rowCountsTowardMeter = (
  row: UsageConsumptionRow,
  meter: QuotaConsumptionScope['meter'],
): boolean => {
  if (meter !== 'quantity') {
    return true;
  }

  const quantityUnit = unitByOperationType[row.operationType];

  return !isDefined(quantityUnit) || row.unit === quantityUnit;
};

export const computeQuotaConsumed = ({
  rows,
  scope,
}: {
  rows: UsageConsumptionRow[];
  scope: QuotaConsumptionScope;
}): number =>
  rows
    .filter(
      (row) =>
        rowMatchesScope(row, scope) && rowCountsTowardMeter(row, scope.meter),
    )
    .reduce((total, row) => total + Number(row[scope.meter]), 0);
