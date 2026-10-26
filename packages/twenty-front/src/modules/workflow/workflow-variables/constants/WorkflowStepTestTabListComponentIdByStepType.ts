import { WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowLogicFunctionTabListComponentId';
import { WORKFLOW_LOGIC_FUNCTION_ACTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/logic-function-action/constants/WorkflowLogicFunctionActionTabListComponentId';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const WORKFLOW_STEP_TEST_TAB_LIST_COMPONENT_ID_BY_STEP_TYPE: Partial<
  Record<StepOutputSchemaV2['type'], string>
> = {
  CODE: WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID,
  LOGIC_FUNCTION: WORKFLOW_LOGIC_FUNCTION_ACTION_TAB_LIST_COMPONENT_ID,
};
