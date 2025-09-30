import { stepsOutputSchemaFamilyState } from '@/workflow/states/stepsOutputSchemaFamilyState';
import {
  type WorkflowActionType,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { isFindRecordsOutputSchema } from '@/workflow/workflow-variables/types/guards/isFindRecordsOutputSchema';
import {
  type OutputSchemaV2,
  type StepOutputSchemaV2,
} from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { FeatureFlagKey } from '~/generated/graphql';

const getFilteredOutputSchema = ({
  stepType,
  outputSchema,
  isIteratorEnabled,
}: {
  stepType: WorkflowActionType;
  outputSchema: OutputSchemaV2;
  isIteratorEnabled: boolean;
}) => {
  if (!isIteratorEnabled && isFindRecordsOutputSchema(stepType, outputSchema)) {
    const filteredOutputSchema = {
      ...outputSchema,
      all: undefined,
    };

    return filteredOutputSchema;
  }

  return outputSchema;
};
export const useStepsOutputSchema = () => {
  const isIteratorEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_ITERATOR_ENABLED,
  );
  const populateStepsOutputSchema = useRecoilCallback(
    ({ set }) =>
      (workflowVersion: WorkflowVersion) => {
        workflowVersion.steps?.forEach((step) => {
          const stepOutputSchema: StepOutputSchemaV2 = {
            id: step.id,
            name: step.name,
            type: step.type,
            icon: getActionIcon(step.type),
            outputSchema: getFilteredOutputSchema({
              stepType: step.type,
              outputSchema: step.settings?.outputSchema as OutputSchemaV2,
              isIteratorEnabled,
            }),
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

          const triggerOutputSchema: StepOutputSchemaV2 = {
            id: TRIGGER_STEP_ID,
            name: isDefined(trigger.name)
              ? trigger.name
              : getTriggerDefaultLabel(trigger),
            type: trigger.type,
            icon: triggerIconKey,
            outputSchema: trigger.settings?.outputSchema as OutputSchemaV2,
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
    [isIteratorEnabled],
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
