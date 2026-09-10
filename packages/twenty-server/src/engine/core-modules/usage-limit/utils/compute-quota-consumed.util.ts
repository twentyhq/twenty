import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

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

  switch (scope.spenderType) {
    case 'workspace':
      return true;
    case 'userWorkspace':
      return spenderColumnMatches(row.userWorkspaceId, scope.spenderId);
    case 'apiKey':
      return spenderColumnMatches(row.apiKeyId, scope.spenderId);
    case 'application':
      return spenderColumnMatches(row.applicationId, scope.spenderId);
    case 'agent':
      return spenderColumnMatches(row.agentId, scope.spenderId);
    case 'workflow':
      return spenderColumnMatches(row.workflowId, scope.spenderId);
    case 'logicFunction':
      return spenderColumnMatches(row.logicFunctionId, scope.spenderId);
  }
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
