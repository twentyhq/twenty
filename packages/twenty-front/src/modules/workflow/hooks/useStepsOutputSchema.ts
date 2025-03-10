import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { WorkflowVersionComponentInstanceContext } from '@/workflow/states/context/WorkflowVersionComponentInstanceContext';
import { stepsOutputSchemaComponentFamilyState } from '@/workflow/states/stepsOutputSchemaFamilyState';
import { WorkflowVersion } from '@/workflow/types/Workflow';
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

export const useStepsOutputSchema = ({
  instanceIdFromProps,
}: {
  instanceIdFromProps?: string;
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    WorkflowVersionComponentInstanceContext,
    instanceIdFromProps,
  );

  const stepsOutputSchemaFamilyState = useRecoilComponentCallbackStateV2(
    stepsOutputSchemaComponentFamilyState,
    instanceId,
  );

  const getStepsOutputSchema = useRecoilCallback(
    ({ snapshot }) =>
      (stepIds: string[]) => {
        const stepsOutputSchema = stepIds
          .map((stepId) =>
            snapshot
              .getLoadable(stepsOutputSchemaFamilyState(stepId))
              .getValue(),
          )
          .filter(isDefined);

        return stepsOutputSchema;
      },
    [stepsOutputSchemaFamilyState],
  );

  const populateStepsOutputSchema = useRecoilCallback(
    ({ set }) =>
      (workflowVersion: WorkflowVersion) => {
        workflowVersion?.steps?.forEach((step) => {
          const stepOutputSchema: StepOutputSchema = {
            id: step.id,
            name: step.name,
            icon: getActionIcon(step.type),
            outputSchema: step.settings.outputSchema as OutputSchema,
          };

          set(stepsOutputSchemaFamilyState(step.id), stepOutputSchema);
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
            outputSchema: trigger.settings.outputSchema as OutputSchema,
          };

          set(
            stepsOutputSchemaFamilyState(TRIGGER_STEP_ID),
            triggerOutputSchema,
          );
        }
      },
    [stepsOutputSchemaFamilyState],
  );

  const resetStepsOutputSchema = useRecoilCallback(
    ({ reset }) =>
      ({ stepId }: { stepId: string }) => {
        reset(stepsOutputSchemaFamilyState(stepId));
      },
    [stepsOutputSchemaFamilyState],
  );

  return {
    populateStepsOutputSchema,
    resetStepsOutputSchema,
    getStepsOutputSchema,
  };
};
