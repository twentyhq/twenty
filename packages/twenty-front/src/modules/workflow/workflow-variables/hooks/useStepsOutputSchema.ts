import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { shouldRecomputeOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/shouldRecomputeOutputSchemaFamilyState';
import { stepsOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaFamilyState';
import { stepsOutputSchemaLocaleFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaLocaleFamilyState';
import {
  type OutputSchemaV2,
  type StepOutputSchemaV2,
} from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import {
  computeStepOutputSchema,
  shouldComputeOutputSchemaOnFrontend,
} from '@/workflow/workflow-variables/utils/generate/computeStepOutputSchema';
import { resolvePersistedStepOutputSchema } from '@/workflow/workflow-variables/utils/resolvePersistedStepOutputSchema';
import { translatePersistedOutputSchemaLabels } from '@/workflow/workflow-variables/utils/translatePersistedOutputSchemaLabels';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isBaseOutputSchemaV2, TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useToast } from 'twenty-ui/components';
import { ComputeStepOutputSchemaDocument } from '~/generated/graphql';

export const useStepsOutputSchema = () => {
  const store = useStore();
  const client = useApolloCoreClient();
  const isCore = useIsWorkflowCoreEnabled();
  const { enqueueToast } = useToast();
  const { i18n } = useLingui();

  const populateStepsOutputSchema = useCallback(
    (workflowVersion: WorkflowVersion) => {
      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);
      const locale = i18n.locale;

      // Cached schemas hold step names and labels translated when they were computed
      const isComputedInLocale = (stepKey: string) =>
        store.get(stepsOutputSchemaLocaleFamilyState.atomFamily(stepKey)) ===
        locale;

      workflowVersion.steps?.forEach((step) => {
        const stepKey = getStepOutputSchemaFamilyStateKey(
          workflowVersion.id,
          step.id,
        );

        const shouldRecompute = store.get(
          shouldRecomputeOutputSchemaFamilyState.atomFamily(stepKey),
        );

        const shouldComputeOnFrontend = shouldComputeOutputSchemaOnFrontend(
          step.type,
        );

        if (!shouldRecompute && isComputedInLocale(stepKey)) {
          return;
        }

        const outputSchema = shouldComputeOnFrontend
          ? computeStepOutputSchema({
              step,
              objectMetadataItems,
            })
          : resolvePersistedStepOutputSchema({
              stepType: step.type,
              settings: step.settings,
            });

        const stepOutputSchema: StepOutputSchemaV2 = {
          id: step.id,
          name: getWorkflowStepDisplayName({
            name: step.name,
            type: step.type,
          }),
          type: step.type,
          icon: getActionIcon(step.type),
          outputSchema: (outputSchema ?? {}) as OutputSchemaV2,
          objectName: (step.settings?.input as { objectName?: string })
            ?.objectName,
        };

        store.set(
          stepsOutputSchemaFamilyState.atomFamily(stepKey),
          stepOutputSchema,
        );
        store.set(
          stepsOutputSchemaLocaleFamilyState.atomFamily(stepKey),
          locale,
        );
        store.set(
          shouldRecomputeOutputSchemaFamilyState.atomFamily(stepKey),
          false,
        );

        if (isCore && step.type === 'ITERATOR') {
          void client
            .mutate({
              mutation: ComputeStepOutputSchemaDocument,
              variables: {
                input: { coreWorkflowVersionId: workflowVersion.id, step },
              },
            })
            .then(({ data }) => {
              const outputSchema = data?.computeStepOutputSchema;
              const schemaState =
                stepsOutputSchemaFamilyState.atomFamily(stepKey);
              if (
                store.get(schemaState) === stepOutputSchema &&
                isBaseOutputSchemaV2(outputSchema)
              ) {
                store.set(schemaState, {
                  ...stepOutputSchema,
                  outputSchema: translatePersistedOutputSchemaLabels({
                    stepType: step.type,
                    outputSchema,
                  }),
                });
              }
            })
            .catch((error: Error) => {
              enqueueToast(getToastOptionsFromError({ error }));
            });
        }
      });

      const trigger = workflowVersion.trigger;

      if (isDefined(trigger)) {
        const triggerKey = getStepOutputSchemaFamilyStateKey(
          workflowVersion.id,
          TRIGGER_STEP_ID,
        );

        const shouldRecompute = store.get(
          shouldRecomputeOutputSchemaFamilyState.atomFamily(triggerKey),
        );

        const shouldComputeOnFrontend = shouldComputeOutputSchemaOnFrontend(
          trigger.type,
        );

        if (!shouldRecompute && isComputedInLocale(triggerKey)) {
          return;
        }

        const triggerIconKey = getTriggerIcon(trigger);

        const outputSchema = shouldComputeOnFrontend
          ? computeStepOutputSchema({
              step: trigger,
              objectMetadataItems,
            })
          : resolvePersistedStepOutputSchema({
              stepType: trigger.type,
              settings: trigger.settings,
            });

        const triggerOutputSchema: StepOutputSchemaV2 = {
          id: TRIGGER_STEP_ID,
          name: getWorkflowStepDisplayName({
            name: isDefined(trigger.name)
              ? trigger.name
              : getTriggerDefaultLabel(trigger),
            type: trigger.type,
          }),
          type: trigger.type,
          icon: triggerIconKey,
          outputSchema: (outputSchema ?? {}) as OutputSchemaV2,
        };

        store.set(
          stepsOutputSchemaFamilyState.atomFamily(triggerKey),
          triggerOutputSchema,
        );
        store.set(
          stepsOutputSchemaLocaleFamilyState.atomFamily(triggerKey),
          locale,
        );
        store.set(
          shouldRecomputeOutputSchemaFamilyState.atomFamily(triggerKey),
          false,
        );
      }
    },
    [store, client, isCore, enqueueToast, i18n.locale],
  );

  const markStepForRecomputation = useCallback(
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
      store.set(
        shouldRecomputeOutputSchemaFamilyState.atomFamily(stepKey),
        true,
      );
    },
    [store],
  );

  const deleteStepsOutputSchema = useCallback(
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
        store.set(stepsOutputSchemaFamilyState.atomFamily(stepKey), null);
        store.set(
          shouldRecomputeOutputSchemaFamilyState.atomFamily(stepKey),
          true,
        );
      });
    },
    [store],
  );

  return {
    populateStepsOutputSchema,
    markStepForRecomputation,
    deleteStepsOutputSchema,
  };
};
