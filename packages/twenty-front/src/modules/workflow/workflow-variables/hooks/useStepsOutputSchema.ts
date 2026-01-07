import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { shouldRecomputeOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/shouldRecomputeOutputSchemaFamilyState';
import { stepsOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaFamilyState';
import {
  type OutputSchemaV2,
  type StepOutputSchemaV2,
} from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import {
  computeStepOutputSchema,
  shouldComputeOutputSchemaOnFrontend,
} from '@/workflow/workflow-variables/utils/generate/computeStepOutputSchema';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useStepsOutputSchema = () => {
  const populateStepsOutputSchema = useRecoilCallback(
    ({ set, snapshot }) =>
      (workflowVersion: WorkflowVersion) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        workflowVersion.steps?.forEach((step) => {
          const stepKey = getStepOutputSchemaFamilyStateKey(
            workflowVersion.id,
            step.id,
          );

          const shouldRecompute = snapshot
            .getLoadable(shouldRecomputeOutputSchemaFamilyState(stepKey))
            .getValue();

          const shouldComputeOnFrontend = shouldComputeOutputSchemaOnFrontend(
            step.type,
          );

          if (!shouldRecompute) {
            return;
          }

          const outputSchema = shouldComputeOnFrontend
            ? computeStepOutputSchema({
                step,
                objectMetadataItems,
              })
            : step.settings?.outputSchema;

          const stepOutputSchema: StepOutputSchemaV2 = {
            id: step.id,
            name: step.name,
            type: step.type,
            icon: getActionIcon(step.type),
            outputSchema: (outputSchema ?? {}) as OutputSchemaV2,
            objectName: (step.settings?.input as { objectName?: string })
              ?.objectName,
          };

          set(stepsOutputSchemaFamilyState(stepKey), stepOutputSchema);
          set(shouldRecomputeOutputSchemaFamilyState(stepKey), false);
        });

        const trigger = workflowVersion.trigger;

        if (isDefined(trigger)) {
          const triggerKey = getStepOutputSchemaFamilyStateKey(
            workflowVersion.id,
            TRIGGER_STEP_ID,
          );

          const shouldRecompute = snapshot
            .getLoadable(shouldRecomputeOutputSchemaFamilyState(triggerKey))
            .getValue();

          const shouldComputeOnFrontend = shouldComputeOutputSchemaOnFrontend(
            trigger.type,
          );

          if (!shouldRecompute) {
            return;
          }

          const triggerIconKey = getTriggerIcon(trigger);

          const outputSchema = shouldComputeOnFrontend
            ? computeStepOutputSchema({
                step: trigger,
                objectMetadataItems,
              })
            : trigger.settings?.outputSchema;

          const triggerOutputSchema: StepOutputSchemaV2 = {
            id: TRIGGER_STEP_ID,
            name: isDefined(trigger.name)
              ? trigger.name
              : getTriggerDefaultLabel(trigger),
            type: trigger.type,
            icon: triggerIconKey,
            outputSchema: (outputSchema ?? {}) as OutputSchemaV2,
          };

          set(stepsOutputSchemaFamilyState(triggerKey), triggerOutputSchema);
          set(shouldRecomputeOutputSchemaFamilyState(triggerKey), false);
        }
      },
    [],
  );

  const markStepForRecomputation = useRecoilCallback(
    ({ set }) =>
      ({
        stepId,
        workflowVersionId,
      }: {
        stepId: string;
        workflowVersionId: string;
      }) => {
        const stepKey = getStepOutputSchemaFamilyStateKey(
          workflowVersionId,
          stepId,
        );
        set(shouldRecomputeOutputSchemaFamilyState(stepKey), true);
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
          const stepKey = getStepOutputSchemaFamilyStateKey(
            workflowVersionId,
            stepId,
          );
          set(stepsOutputSchemaFamilyState(stepKey), null);
          set(shouldRecomputeOutputSchemaFamilyState(stepKey), true);
        });
      },
    [],
  );

  return {
    populateStepsOutputSchema,
    markStepForRecomputation,
    deleteStepsOutputSchema,
  };
};
