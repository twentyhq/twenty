import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Builders from before 2.57 still send the order computed from recordSorts; remove once 2.57 leaves the cross-upgrade window
export const dropComputedFindRecordsOrderBy = (
  steps: WorkflowAction[] | null,
): WorkflowAction[] | null =>
  steps?.map((step) => {
    const orderBy: unknown =
      step.type === WorkflowActionType.FIND_RECORDS
        ? step.settings.input.orderBy
        : undefined;

    if (
      !isPlainObject(orderBy) ||
      !isDefined(orderBy.recordSorts) ||
      !('gqlOperationOrderBy' in orderBy)
    ) {
      return step;
    }

    const { gqlOperationOrderBy: _gqlOperationOrderBy, ...recordSortsOnly } =
      orderBy;

    return {
      ...step,
      settings: {
        ...step.settings,
        input: { ...step.settings.input, orderBy: recordSortsOnly },
      },
    } as WorkflowAction;
  }) ?? null;
