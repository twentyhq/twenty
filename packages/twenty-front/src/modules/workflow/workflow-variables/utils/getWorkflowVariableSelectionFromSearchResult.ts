import { type WorkflowVariableSearchResult } from '@/workflow/workflow-variables/types/WorkflowVariableSearchResult';
import { type WorkflowVariableSelection } from '@/workflow/workflow-variables/types/WorkflowVariableSelection';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';

export const getWorkflowVariableSelectionFromSearchResult = (
  result: WorkflowVariableSearchResult,
): WorkflowVariableSelection => ({
  rawVariableName: getVariableTemplateFromPath({
    stepId: result.stepId,
    path: result.path,
  }),
  stepId: result.stepId,
  isFullRecord: result.isFullRecord ?? false,
});
