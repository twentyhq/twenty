import { isDefined } from 'twenty-shared/utils';

import { type QuotaCounterRequest } from 'src/engine/core-modules/usage-limit/types/quota-counter-request.type';
import { type UsageCell } from 'src/engine/core-modules/usage-limit/types/usage-cell.type';

// Projects one aggregate query onto every counter of the resource: each
// counter takes the cells its scope covers. Returns null for a scope the
// cells cannot express, so the caller leaves that counter cold instead of
// installing a budget computed from the wrong slice.
export const sumUsageForQuotaCounter = ({
  counter,
  cells,
}: {
  counter: QuotaCounterRequest;
  cells: UsageCell[];
}): number | null => {
  if (
    counter.spenderType !== 'workspace' &&
    counter.spenderType !== 'userWorkspace'
  ) {
    return null;
  }

  return cells
    .filter(
      (cell) =>
        counter.operationType === '' ||
        cell.operationType === counter.operationType,
    )
    .filter((cell) => {
      if (counter.spenderType === 'workspace') {
        return true;
      }

      // A pooled userWorkspace counter covers usage attributed to any user,
      // not usage the workspace consumed with no user attached.
      return isDefined(counter.spenderId)
        ? cell.userWorkspaceId === counter.spenderId
        : cell.userWorkspaceId !== '';
    })
    .reduce((sum, cell) => sum + cell.total, 0);
};
