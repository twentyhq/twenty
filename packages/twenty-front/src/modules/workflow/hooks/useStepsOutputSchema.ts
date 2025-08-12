import { stepsOutputSchemaFamilyState } from '@/workflow/states/stepsOutputSchemaFamilyState';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import {
  type OutputSchema,
  type StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useStepsOutputSchema = () => {
  const populateStepsOutputSchema = useRecoilCallback(
    ({ set }) =>
      (workflowVersion: WorkflowVersion) => {
        workflowVersion.steps?.forEach((step) => {
          const stepOutputSchema: StepOutputSchema = {
            id: step.id,
            name: step.name,
            icon: getActionIcon(step.type),
            outputSchema: step.settings?.outputSchema as OutputSchema,
          };

          set(
            stepsOutputSchemaFamilyState(
              getStepOutputSchemaFamilyStateKey(workflowVersion.id, step.id),
            ),
            stepOutputSchema,
          );
        });

        const trigger = workflowVersion.trigger;

        if (isDefined(trigger)) {
          const triggerIconKey = getTriggerIcon(trigger);

          const triggerOutputSchema: StepOutputSchema = {
            id: TRIGGER_STEP_ID,
            name: isDefined(trigger.name)
              ? trigger.name
              : getTriggerDefaultLabel(trigger),
            icon: triggerIconKey,
            outputSchema: trigger.settings?.outputSchema as OutputSchema,
          };

          set(
            stepsOutputSchemaFamilyState(
              getStepOutputSchemaFamilyStateKey(
                workflowVersion.id,
                TRIGGER_STEP_ID,
              ),
            ),
            triggerOutputSchema,
          );
        }
      },
    [],
  );

  const deleteStepsOutputSchema = useRecoilCallback(
    ({ set }) =>
      ({
        stepIds,
        workflowVersionId,
      }: {
        stepIds: string[];
        workflowVersionId: string;
      }) => {
        stepIds.forEach((stepId) => {
          set(
            stepsOutputSchemaFamilyState(
              getStepOutputSchemaFamilyStateKey(workflowVersionId, stepId),
            ),
            null,
          );
        });
      },
    [],
  );

  return {
    populateStepsOutputSchema,
    deleteStepsOutputSchema,
  };
};
