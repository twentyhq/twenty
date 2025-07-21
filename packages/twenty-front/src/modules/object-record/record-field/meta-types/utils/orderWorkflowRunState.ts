import { WorkflowRunState } from '@/workflow/types/Workflow';
import { workflowRunStateSchema } from '@/workflow/validation-schemas/workflowSchema';
import { isDefined } from 'twenty-shared/utils';
import { JsonValue } from 'type-fest';

export const orderWorkflowRunState = (value: JsonValue) => {
  const parsedValue = workflowRunStateSchema.safeParse(value);
  if (!parsedValue.success) {
    return null;
  }

  const orderedWorkflowRunState: WorkflowRunState = {
    ...(isDefined(parsedValue.data.workflowRunError)
      ? {
          workflowRunError: parsedValue.data.workflowRunError,
        }
      : {}),
    stepInfos: parsedValue.data.stepInfos,
    flow: parsedValue.data.flow,
  };

  return orderedWorkflowRunState;
};
