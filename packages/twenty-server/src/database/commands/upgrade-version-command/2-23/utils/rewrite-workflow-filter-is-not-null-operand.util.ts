import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// isNotNull was the legacy relation "is set" operand, retired in mid-2024 in
// favor of IS_NOT_EMPTY. Old workflow filter steps still store it (as the
// deprecated camelCase value or its normalized IS_NOT_NULL form), and no
// evaluator supports it, so running those steps throws. Rewrite it to the
// equivalent IS_NOT_EMPTY.
const DEPRECATED_IS_NOT_NULL_OPERANDS = new Set(['isNotNull', 'IS_NOT_NULL']);

export const rewriteWorkflowFilterIsNotNullOperand = (
  steps: WorkflowAction[] | null,
): { changed: boolean; value: WorkflowAction[] | null } => {
  if (!isDefined(steps)) {
    return { changed: false, value: steps };
  }

  let changed = false;

  const value = steps.map((step) => {
    if (step.type !== WorkflowActionType.FILTER) {
      return step;
    }

    const stepFilters = step.settings?.input?.stepFilters;

    if (!isDefined(stepFilters)) {
      return step;
    }

    const rewrittenStepFilters = stepFilters.map((stepFilter) => {
      if (!DEPRECATED_IS_NOT_NULL_OPERANDS.has(stepFilter.operand)) {
        return stepFilter;
      }

      changed = true;

      return { ...stepFilter, operand: ViewFilterOperand.IS_NOT_EMPTY };
    });

    return {
      ...step,
      settings: {
        ...step.settings,
        input: { ...step.settings.input, stepFilters: rewrittenStepFilters },
      },
    };
  });

  return { changed, value };
};
