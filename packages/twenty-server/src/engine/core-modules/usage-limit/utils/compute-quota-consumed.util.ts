import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';

const spenderColumnMatches = (
  rowValue: string,
  spenderId: string | null,
): boolean =>
  isDefined(spenderId) ? rowValue === spenderId : isNonEmptyString(rowValue);

const rowMatchesCounter = (
  row: QuotaConsumptionRow,
  counter: LimitQuotaCounter,
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
      return spenderColumnMatches(row.agentId, counter.spenderId);
    case 'workflow':
      return spenderColumnMatches(row.workflowId, counter.spenderId);
    case 'logicFunction':
      return spenderColumnMatches(row.logicFunctionId, counter.spenderId);
  }
};

export const computeQuotaConsumed = ({
  rows,
  counter,
}: {
  rows: QuotaConsumptionRow[];
  counter: LimitQuotaCounter;
}): number =>
  rows
    .filter((row) => rowMatchesCounter(row, counter))
    .reduce((total, row) => total + Number(row[counter.meter]), 0);
