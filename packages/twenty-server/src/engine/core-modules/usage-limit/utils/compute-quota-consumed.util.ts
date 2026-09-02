import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';

const spenderColumnMatches = (
  rowValue: string,
  spenderId: string | null,
): boolean => (isDefined(spenderId) ? rowValue === spenderId : rowValue !== '');

const rowMatchesCounter = (
  row: QuotaConsumptionRow,
  counter: QuotaCounter,
): boolean => {
  if (
    counter.operationType !== UsageOperationType.ALL &&
    row.operationType !== counter.operationType
  ) {
    return false;
  }

  switch (counter.spenderType) {
    case 'workspace':
      return true;
    case 'userWorkspace':
      return spenderColumnMatches(row.userWorkspaceId, counter.spenderId);
    case 'apiKey':
      return spenderColumnMatches(row.apiKeyId, counter.spenderId);
    case 'application':
      return spenderColumnMatches(row.applicationId, counter.spenderId);
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
  counter,
}: {
  rows: QuotaConsumptionRow[];
  counter: QuotaCounter;
}): number =>
  rows
    .filter((row) => rowMatchesCounter(row, counter))
    .reduce((total, row) => total + Number(row[counter.meter]), 0);
