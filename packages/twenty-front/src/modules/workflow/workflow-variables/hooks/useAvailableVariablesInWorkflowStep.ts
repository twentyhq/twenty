import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { getPreviousSteps } from '@/workflow/workflow-steps/utils/getWorkflowPreviousSteps';
import {
  type OutputSchema,
  type StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { filterOutputSchema } from '@/workflow/workflow-variables/utils/filterOutputSchema';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { isEmptyObject } from '~/utils/isEmptyObject';

export const useAvailableVariablesInWorkflowStep = ({
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  fieldTypesToExclude,
}: {
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  fieldTypesToExclude?: InputSchemaPropertyType[];
}): StepOutputSchema[] => {
  const workflowSelectedNode = useRecoilComponentValue(
    workflowSelectedNodeComponentState,
  );
  const flow = useFlowOrThrow();
  const steps = flow.steps ?? [];

  const previousStepIds: string[] = isDefined(workflowSelectedNode)
    ? getPreviousSteps(steps, workflowSelectedNode).map((step) => step.id)
    : [];

  const availableStepsOutputSchema: StepOutputSchema[] = useRecoilValue(
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
      }) as OutputSchema;

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
