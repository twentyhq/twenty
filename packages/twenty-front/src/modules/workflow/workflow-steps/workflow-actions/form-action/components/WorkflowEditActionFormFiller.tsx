import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowRunSSESubscribeEffect } from '@/workflow/workflow-diagram/components/WorkflowRunSSESubscribeEffect';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { useUpdateWorkflowRunStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowRunStep';
import { WorkflowFormFillerFields } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFillerFields';
import { WorkflowFormStepAskSubmitButton } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormStepAskSubmitButton';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export type WorkflowEditActionFormFillerProps = {
  action: WorkflowFormAction;
  actionOptions: {
    readonly: boolean;
  };
};

type FormData = WorkflowFormActionField[];

export const WorkflowEditActionFormFiller = ({
  action,
  actionOptions,
}: WorkflowEditActionFormFillerProps) => {
  const { t } = useLingui();
  const [formData, setFormData] = useState<FormData>(action.settings.input);
  const workflowRunId = useWorkflowRunIdOrThrow();
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { updateWorkflowRunStep } = useUpdateWorkflowRunStep();
  const [error, setError] = useState<string | undefined>(undefined);
  // A form is submitted by answering its Ask, which a workspace the Ask
  // object has not reached yet cannot do.
  const inputAskObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    { objectName: CoreObjectNameSingular.InputAsk, objectNameType: 'singular' },
  );

  const canSubmit = !actionOptions.readonly && !isDefined(error);

  const onFieldUpdate = ({
    fieldId,
    value,
  }: {
    fieldId: string;
    value: unknown;
  }) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedFormData = formData.map((field) =>
      field.id === fieldId ? { ...field, value } : field,
    );

    setFormData(updatedFormData);

    saveAction(updatedFormData);
  };

  const saveAction = useDebouncedCallback(async (updatedFormData: FormData) => {
    if (actionOptions.readonly === true) {
      return;
    }

    await updateWorkflowRunStep({
      workflowRunId,
      step: {
        ...action,
        settings: { ...action.settings, input: updatedFormData },
      },
    });
  }, 1_000);

  const getResponse = async () => {
    await saveAction.flush();

    return Object.fromEntries(
      formData.map((field) => [field.name, field.value]),
    );
  };

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  return (
    <>
      <WorkflowRunSSESubscribeEffect workflowRunId={workflowRunId} />
      <WorkflowStepBody>
        <WorkflowFormFillerFields
          fields={formData}
          readonly={actionOptions.readonly}
          onFieldUpdate={onFieldUpdate}
          onError={setError}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && (
        <SidePanelFooter
          actions={[
            isDefined(inputAskObjectMetadataItem) ? (
              <WorkflowFormStepAskSubmitButton
                key="submit"
                workflowRunId={workflowRunId}
                stepId={action.id}
                disabled={!canSubmit}
                getResponse={getResponse}
                onSubmitted={goBackFromSidePanel}
              />
            ) : (
              <WorkflowStepCmdEnterButton
                key="submit"
                title={t`Submit`}
                onClick={() => {}}
                disabled
              />
            ),
          ]}
        />
      )}
    </>
  );
};
