import { stepsOutputSchemaFamilyState } from '@/workflow/states/stepsOutputSchemaFamilyState';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

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

  const deleteStepOutputSchema = useRecoilCallback(
    ({ set }) =>
      ({
        stepId,
        workflowVersionId,
      }: {
        stepId: string;
        workflowVersionId: string;
      }) => {
        set(
          stepsOutputSchemaFamilyState(
            getStepOutputSchemaFamilyStateKey(workflowVersionId, stepId),
          ),
          null,
        );
      },
    [],
  );

  return {
    populateStepsOutputSchema,
    deleteStepOutputSchema,
  };
};
