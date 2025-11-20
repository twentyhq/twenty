import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { getPreviousSteps } from '@/workflow/workflow-steps/utils/getWorkflowPreviousSteps';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { filterOutputSchema } from '@/workflow/workflow-variables/utils/filterOutputSchema';
import { useRecoilValue } from 'recoil';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useAvailableVariablesInWorkflowStep = ({
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  fieldTypesToExclude,
}: {
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  fieldTypesToExclude?: InputSchemaPropertyType[];
}): StepOutputSchemaV2[] => {
  const workflowSelectedNode = useRecoilComponentValue(
    workflowSelectedNodeComponentState,
  );
  const flow = useFlowOrThrow();
  const steps = flow.steps ?? [];
  const currentStep = steps.find((step) => step.id === workflowSelectedNode);

  const previousStepIds: string[] = isDefined(currentStep)
    ? getPreviousSteps({ steps, currentStep }).map((step) => step.id)
    : [];

  const availableStepsOutputSchema: StepOutputSchemaV2[] = useRecoilValue(
    stepsOutputSchemaFamilySelector({
      workflowVersionId: flow.workflowVersionId,
      stepIds: [TRIGGER_STEP_ID, ...previousStepIds],
    }),
  );

  const availableVariablesInWorkflowStep = availableStepsOutputSchema
    .map((stepOutputSchema) => {
      const outputSchema = filterOutputSchema({
        shouldDisplayRecordFields,
        shouldDisplayRecordObjects,
        outputSchema: stepOutputSchema.outputSchema,
        fieldTypesToExclude,
      });

      if (!isDefined(outputSchema) || isEmptyObject(outputSchema)) {
        return undefined;
      }

      return {
        id: stepOutputSchema.id,
        name: stepOutputSchema.name,
        icon: stepOutputSchema.icon,
        type: stepOutputSchema.type,
        outputSchema,
      };
    })
    .filter(isDefined);

  return availableVariablesInWorkflowStep;
};
