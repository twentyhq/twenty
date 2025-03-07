import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { filterOutputSchema } from '@/workflow/workflow-variables/utils/filterOutputSchema';
import { isEmptyObject } from '@tiptap/core';
import { isDefined } from 'twenty-shared';

export const useAvailableVariablesInWorkflowStep = ({
  objectNameSingularToSelect,
}: {
  objectNameSingularToSelect?: string;
}): StepOutputSchema[] => {
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();
  const flow = useFlowOrThrow();
  const { getStepsOutputSchema } = useStepsOutputSchema({});

  const steps = flow.steps ?? [];

  const previousStepIds: string[] = [];

  for (const step of steps) {
    if (step.id === workflowSelectedNode) {
      break;
    }
    previousStepIds.push(step.id);
  }

  const availableStepsOutputSchema: StepOutputSchema[] =
    getStepsOutputSchema(previousStepIds).filter(isDefined);

  const triggersOutputSchema: StepOutputSchema[] = getStepsOutputSchema([
    TRIGGER_STEP_ID,
  ]).filter(isDefined);

  const availableVariablesInWorkflowStep = [
    ...availableStepsOutputSchema,
    ...triggersOutputSchema,
  ]
    .map((stepOutputSchema) => {
      const outputSchema = filterOutputSchema(
        stepOutputSchema.outputSchema,
        objectNameSingularToSelect,
      ) as OutputSchema;

      if (!isDefined(outputSchema) || isEmptyObject(outputSchema)) {
        return undefined;
      }

      return {
        id: stepOutputSchema.id,
        name: stepOutputSchema.name,
        icon: stepOutputSchema.icon,
        outputSchema,
      };
    })
    .filter(isDefined);

  return availableVariablesInWorkflowStep;
};
