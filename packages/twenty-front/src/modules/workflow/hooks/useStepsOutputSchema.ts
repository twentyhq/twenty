import { stepsOutputSchemaFamilyState } from '@/workflow/states/stepsOutputSchemaFamilyState';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { getStepOutputSchemaKey } from '@/workflow/utils/getStepOutputSchemaKey';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { getTriggerStepName } from '@/workflow/workflow-variables/utils/getTriggerStepName';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useStepsOutputSchema = () => {
  const getStepsOutputSchema = useRecoilCallback(
    ({ snapshot }) =>
      ({
        workflowVersionId,
        stepIds,
      }: {
        workflowVersionId: string;
        stepIds: string[];
      }) => {
        const stepsOutputSchema = stepIds
          .map((stepId) => getStepOutputSchemaKey(workflowVersionId, stepId))
          .map((stepOutputSchemaKey) =>
            snapshot
              .getLoadable(stepsOutputSchemaFamilyState(stepOutputSchemaKey))
              .getValue(),
          )
          .filter(isDefined);

        return stepsOutputSchema;
      },
    [],
  );

  const populateStepsOutputSchema = useRecoilCallback(
    ({ set }) =>
      (workflowVersion: WorkflowVersion) => {
        workflowVersion?.steps?.forEach((step) => {
          const stepOutputSchema: StepOutputSchema = {
            id: step.id,
            name: step.name,
            icon: getActionIcon(step.type),
            outputSchema: step.settings?.outputSchema as OutputSchema,
          };

          set(
            stepsOutputSchemaFamilyState(
              getStepOutputSchemaKey(workflowVersion.id, step.id),
            ),
            stepOutputSchema,
          );
        });

        const trigger = workflowVersion.trigger;

        if (isDefined(trigger)) {
          const triggerIconKey =
            trigger.type === 'DATABASE_EVENT'
              ? getTriggerIcon({
                  type: trigger.type,
                  eventName: splitWorkflowTriggerEventName(
                    trigger.settings?.eventName,
                  ).event,
                })
              : getTriggerIcon({
                  type: trigger.type,
                });

          const triggerOutputSchema: StepOutputSchema = {
            id: TRIGGER_STEP_ID,
            name: isDefined(trigger.name)
              ? trigger.name
              : getTriggerStepName(trigger),
            icon: triggerIconKey,
            outputSchema: trigger.settings?.outputSchema as OutputSchema,
          };

          set(
            stepsOutputSchemaFamilyState(
              getStepOutputSchemaKey(workflowVersion.id, TRIGGER_STEP_ID),
            ),
            triggerOutputSchema,
          );
        }
      },
    [],
  );

  const resetStepOutputSchema = useRecoilCallback(
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
            getStepOutputSchemaKey(workflowVersionId, stepId),
          ),
          null,
        );
      },
    [],
  );

  return {
    populateStepsOutputSchema,
    resetStepOutputSchema,
    getStepsOutputSchema,
  };
};
