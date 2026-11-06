import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import {
  type WorkflowStep,
  type WorkflowTrigger,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { shouldRecomputeOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/shouldRecomputeOutputSchemaFamilyState';
import { stepsOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaFamilyState';
import { stepsOutputSchemaLocaleFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaLocaleFamilyState';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { translatePersistedOutputSchemaLabels } from '@/workflow/workflow-variables/utils/translatePersistedOutputSchemaLabels';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { ComputeStepOutputSchemaDocument } from '~/generated/graphql';

export const useStepsOutputSchema = () => {
  const store = useStore();
  const client = useApolloCoreClient();
  const { i18n } = useLingui();

  const populateStepsOutputSchema = useCallback(
    (workflowVersion: WorkflowVersion) => {
      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);
      const locale = i18n.locale;

      const populateStepOutputSchema = ({
        step,
        stepKey,
        stepOutputSchemaWithoutSchema,
      }: {
        step: WorkflowStep | WorkflowTrigger;
        stepKey: string;
        stepOutputSchemaWithoutSchema: Omit<StepOutputSchemaV2, 'outputSchema'>;
      }) => {
        const shouldRecompute = store.get(
          shouldRecomputeOutputSchemaFamilyState.atomFamily(stepKey),
        );
        const isComputedInLocale =
          store.get(stepsOutputSchemaLocaleFamilyState.atomFamily(stepKey)) ===
          locale;

        if (!shouldRecompute && isComputedInLocale) {
          return;
        }

        const translate = (outputSchema: unknown) =>
          translatePersistedOutputSchemaLabels({
            stepType: step.type,
            outputSchema,
            objectMetadataItems,
          });

        const storedStepOutputSchema: StepOutputSchemaV2 = {
          ...stepOutputSchemaWithoutSchema,
          outputSchema: translate(step.settings?.outputSchema),
        };
        const schemaState = stepsOutputSchemaFamilyState.atomFamily(stepKey);

        store.set(schemaState, storedStepOutputSchema);
        store.set(
          stepsOutputSchemaLocaleFamilyState.atomFamily(stepKey),
          locale,
        );
        store.set(
          shouldRecomputeOutputSchemaFamilyState.atomFamily(stepKey),
          false,
        );

        // a stored schema can predate a metadata change, so the server recomputes it
        void client
          .mutate({
            mutation: ComputeStepOutputSchemaDocument,
            variables: {
              input: { coreWorkflowVersionId: workflowVersion.id, step },
            },
          })
          .then(({ data }) => {
            if (store.get(schemaState) === storedStepOutputSchema) {
              store.set(schemaState, {
                ...storedStepOutputSchema,
                outputSchema: translate(data?.computeStepOutputSchema),
              });
            }
          })
          // the stored schema stays shown, as for a step whose object was deleted since
          .catch(() => undefined);
      };

      workflowVersion.steps?.forEach((step) =>
        populateStepOutputSchema({
          step,
          stepKey: getStepOutputSchemaFamilyStateKey(
            workflowVersion.id,
            step.id,
          ),
          stepOutputSchemaWithoutSchema: {
            id: step.id,
            name: getWorkflowStepDisplayName({
              name: step.name,
              type: step.type,
            }),
            type: step.type,
            icon: getActionIcon(step.type),
            objectName: (step.settings?.input as { objectName?: string })
              ?.objectName,
          },
        }),
      );

      const trigger = workflowVersion.trigger;

      if (isDefined(trigger)) {
        populateStepOutputSchema({
          step: trigger,
          stepKey: getStepOutputSchemaFamilyStateKey(
            workflowVersion.id,
            TRIGGER_STEP_ID,
          ),
          stepOutputSchemaWithoutSchema: {
            id: TRIGGER_STEP_ID,
            name: getWorkflowStepDisplayName({
              name: isDefined(trigger.name)
                ? trigger.name
                : getTriggerDefaultLabel(trigger),
              type: trigger.type,
            }),
            type: trigger.type,
            icon: getTriggerIcon(trigger),
          },
        });
      }
    },
    [store, client, i18n.locale],
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
