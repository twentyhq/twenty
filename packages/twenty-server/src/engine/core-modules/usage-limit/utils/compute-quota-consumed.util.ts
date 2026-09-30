import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE } from 'src/engine/core-modules/usage-limit/constants/usage-spender-column-by-spender-type.constant';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';

const spenderColumnMatches = (
  rowValue: string,
  spenderId: string | null,
): boolean =>
  isDefined(spenderId) ? rowValue === spenderId : isNonEmptyString(rowValue);

export type QuotaConsumptionScope = Pick<
  LimitQuotaCounter,
  'resourceType' | 'operationType' | 'spenderType' | 'spenderId' | 'meter'
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
}): number => {
  const quantityUnit =
    scope.meter === 'quantity'
      ? findUsageLimitDefinition({
          resourceType: scope.resourceType,
          limitKind: 'quota',
        })?.quantityUnit
      : undefined;

  return rows
    .filter(
      (row) =>
        rowMatchesScope(row, scope) &&
        (!isDefined(quantityUnit) || row.unit === quantityUnit),
    )
    .reduce((total, row) => total + Number(row[scope.meter]), 0);
};
