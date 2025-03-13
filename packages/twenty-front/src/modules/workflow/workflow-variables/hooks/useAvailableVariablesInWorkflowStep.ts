import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { filterOutputSchema } from '@/workflow/workflow-variables/utils/filterOutputSchema';
import { isEmptyObject } from '@tiptap/core';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useAvailableVariablesInWorkflowStep = ({
  objectNameSingularToSelect,
}: {
  objectNameSingularToSelect?: string;
}): StepOutputSchema[] => {
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();
  const flow = useFlowOrThrow();

  const steps = flow.steps ?? [];

  const previousStepIds: string[] = [];

  for (const step of steps) {
    if (step.id === workflowSelectedNode) {
      break;
    }
    previousStepIds.push(step.id);
  }

  const availableStepsOutputSchema: StepOutputSchema[] = useRecoilValue(
    stepsOutputSchemaFamilySelector({
      workflowVersionId: flow.workflowVersionId,
      stepIds: [TRIGGER_STEP_ID, ...previousStepIds],
    }),
  );

  const availableVariablesInWorkflowStep = availableStepsOutputSchema
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
