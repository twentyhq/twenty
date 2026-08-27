import { isDefined } from 'twenty-shared/utils';

import { type QuotaCounterRequest } from 'src/engine/core-modules/usage-limit/types/quota-counter-request.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageCell } from 'src/engine/core-modules/usage-limit/types/usage-cell.type';

const cellSpenderId = (
  cell: UsageCell,
  spenderType: Exclude<SpenderType, 'workspace'>,
): string => {
  switch (spenderType) {
    case 'userWorkspace':
      return cell.userWorkspaceId;
    case 'apiKey':
      return cell.apiKeyId;
    case 'application':
      return cell.applicationId;
    case 'agent':
      return cell.agentId;
    case 'workflow':
      return cell.workflowId;
    case 'logicFunction':
      return cell.logicFunctionId;
  }
};

// Projects one aggregate query onto every counter of the resource: each
// counter takes the cells its scope covers.
export const sumUsageForQuotaCounter = ({
  counter,
  cells,
}: {
  counter: QuotaCounterRequest;
  cells: UsageCell[];
}): number =>
  cells
    .filter(
      (cell) =>
        counter.operationType === '' ||
        cell.operationType === counter.operationType,
    )
    .filter((cell) => {
      if (counter.spenderType === 'workspace') {
        return true;
      }

      const spenderId = cellSpenderId(cell, counter.spenderType);

      // A pooled counter covers usage attributed to any spender of the type,
      // not usage consumed with no such spender attached.
      return isDefined(counter.spenderId)
        ? spenderId === counter.spenderId
        : spenderId !== '';
    })
    .reduce((sum, cell) => sum + cell.total, 0);
