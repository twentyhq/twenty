import { WORKFLOW_STEP_TEST_TAB_LIST_COMPONENT_ID_BY_STEP_TYPE } from '@/workflow/workflow-variables/constants/WorkflowStepTestTabListComponentIdByStepType';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isDefined, isEmptyObject, isNonEmptyArray } from 'twenty-shared/utils';

export const shouldSuggestTestingStep = ({
  step,
  currentPath,
}: {
  step: Pick<StepOutputSchemaV2, 'type' | 'outputSchema'>;
  currentPath: string[];
}): boolean =>
  !isNonEmptyArray(currentPath) &&
  isDefined(WORKFLOW_STEP_TEST_TAB_LIST_COMPONENT_ID_BY_STEP_TYPE[step.type]) &&
  isEmptyObject(step.outputSchema);
