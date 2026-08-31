import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

import { type QuotaBound } from 'src/engine/core-modules/usage-limit/types/quota-bound.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';

const spenderColumnMatches = (
  rowValue: string,
  spenderId: string | null,
): boolean => (isDefined(spenderId) ? rowValue === spenderId : rowValue !== '');

const rowMatchesBound = (
  row: QuotaConsumptionRow,
  bound: QuotaBound,
): boolean => {
  if (
    bound.operationType !== UsageOperationType.ALL &&
    row.operationType !== bound.operationType
  ) {
    return false;
  }

  switch (bound.spenderType) {
    case 'workspace':
      return true;
    case 'userWorkspace':
      return spenderColumnMatches(row.userWorkspaceId, bound.spenderId);
    case 'apiKey':
      return spenderColumnMatches(row.apiKeyId, bound.spenderId);
    case 'application':
      return spenderColumnMatches(row.applicationId, bound.spenderId);
    case 'agent':
    case 'workflow':
    case 'logicFunction':
      return false;
    default:
      return false;
  }
};

export const computeQuotaConsumed = ({
  rows,
  bound,
}: {
  rows: QuotaConsumptionRow[];
  bound: QuotaBound;
}): number =>
  rows
    .filter((row) => rowMatchesBound(row, bound))
    .reduce((total, row) => total + Number(row[bound.meter]), 0);
