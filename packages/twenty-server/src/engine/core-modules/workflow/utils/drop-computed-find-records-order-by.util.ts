import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Builders from before 2.57 still send the order computed from recordSorts; remove once 2.57 leaves the cross-upgrade window
export const dropComputedFindRecordsOrderBy = (
  steps: WorkflowAction[] | null,
): WorkflowAction[] | null =>
  steps?.map((step) => {
    if (step.type !== WorkflowActionType.FIND_RECORDS) {
      return step;
    }

    const orderBy = step.settings.input.orderBy;

    if (
      !isDefined(orderBy) ||
      !isDefined(orderBy.recordSorts) ||
      !('gqlOperationOrderBy' in orderBy)
    ) {
      return step;
    }

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          orderBy: { recordSorts: orderBy.recordSorts },
        },
      },
    };
  }) ?? null;
