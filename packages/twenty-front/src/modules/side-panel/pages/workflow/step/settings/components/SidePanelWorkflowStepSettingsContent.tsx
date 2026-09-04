import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { STEP_RETRY_DELAYS_MS } from 'twenty-shared/workflow';
import { InputLabel } from 'twenty-ui/input';

import { FormBooleanFieldToggleInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { Select } from '@/ui/input/components/Select';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { useLingui } from '@lingui/react/macro';

type StepErrorHandlingOptions =
  WorkflowAction['settings']['errorHandlingOptions'];

const SidePanelWorkflowStepSettingsForm = ({
  step,
}: {
  step: WorkflowAction;
}) => {
  const { t } = useLingui();
  const { updateStep } = useUpdateStep();

  const [errorHandlingOptions, setErrorHandlingOptions] =
    useState<StepErrorHandlingOptions>(step.settings.errorHandlingOptions);

  const updateErrorHandlingOptions = (
    partialOptions: Partial<StepErrorHandlingOptions>,
  ) => {
    const updatedOptions = { ...errorHandlingOptions, ...partialOptions };

    setErrorHandlingOptions(updatedOptions);

    updateStep({
      ...step,
      settings: {
        ...step.settings,
        errorHandlingOptions: updatedOptions,
      },
    } as WorkflowAction);
  };

  return (
    <WorkflowStepBody>
      {step.type !== 'IF_ELSE' && (
        <FormBooleanFieldToggleInput
          description={t`Continue on failure`}
          value={errorHandlingOptions.continueOnFailure.value}
          onChange={(value) =>
            updateErrorHandlingOptions({ continueOnFailure: { value } })
          }
          hint={t`Keep executing the next nodes even if this one fails`}
        />
      )}
      <FormFieldInputContainer>
        <InputLabel>{t`Retry on failure`}</InputLabel>
        <Select
          dropdownId="workflow-step-settings-retry-count"
          options={[
            { label: t`Disabled`, value: 0 },
            ...STEP_RETRY_DELAYS_MS.map((_, index) => ({
              label: index === 0 ? t`1 retry` : t`${index + 1} retries`,
              value: index + 1,
            })),
          ]}
          value={Number(errorHandlingOptions.retryOnFailure.value) || 0}
          onChange={(value) =>
            updateErrorHandlingOptions({ retryOnFailure: { value } })
          }
        />
      </FormFieldInputContainer>
    </WorkflowStepBody>
  );
};

export const SidePanelWorkflowStepSettingsContent = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useAtomComponentStateValue(
    workflowSelectedNodeComponentState,
  );

  const step = flow.steps?.find(
    (candidateStep) => candidateStep.id === workflowSelectedNode,
  );

  if (!isDefined(step)) {
    return null;
  }

  return <SidePanelWorkflowStepSettingsForm key={step.id} step={step} />;
};
