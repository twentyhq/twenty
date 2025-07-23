import { WorkflowRunOutput } from '@/workflow/types/Workflow';
import { workflowRunOutputSchema } from '@/workflow/validation-schemas/workflowSchema';
import { isDefined } from 'twenty-shared/utils';
import { JsonValue } from 'type-fest';

export const orderWorkflowRunOutput = (value: JsonValue) => {
  const parsedValue = workflowRunOutputSchema.safeParse(value);
  if (!parsedValue.success) {
    return null;
  }

  const orderedWorkflowRunOutput: WorkflowRunOutput = {
    ...(isDefined(parsedValue.data.error)
      ? {
          error: parsedValue.data.error,
        }
      : {}),
    ...(isDefined(parsedValue.data.stepsOutput)
      ? {
          stepsOutput: parsedValue.data.stepsOutput,
        }
      : {}),
    flow: parsedValue.data.flow,
  };

  return orderedWorkflowRunOutput;
};
