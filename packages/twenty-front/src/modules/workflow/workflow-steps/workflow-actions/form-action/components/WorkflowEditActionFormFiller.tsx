import { useDoObjectMetadataItemsExist } from '@/object-metadata/hooks/useDoObjectMetadataItemsExist';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowRunSSESubscribeEffect } from '@/workflow/workflow-diagram/components/WorkflowRunSSESubscribeEffect';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { useUpdateWorkflowRunStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowRunStep';
import { WorkflowFormFieldInput } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowFormFieldInput';
import { WorkflowFormStepAskSubmitButton } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormStepAskSubmitButton';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
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
  const doesInputAskObjectExist = useDoObjectMetadataItemsExist([
    CoreObjectNameSingular.InputAsk,
  ]);

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
        {formData.map((field) => {
          if (field.type === 'RECORD') {
            const objectNameSingular = field.settings?.objectName;

            if (!isDefined(objectNameSingular)) {
              return null;
            }

            return (
              <FormSingleRecordPicker
                key={field.id}
                label={field.label}
                defaultValue={field.value?.id}
                onChange={(recordId) => {
                  onFieldUpdate({ fieldId: field.id, value: { id: recordId } });
                }}
                objectNameSingulars={[objectNameSingular]}
                disabled={actionOptions.readonly}
              />
            );
          }

          if (field.type === 'SELECT' || field.type === 'MULTI_SELECT') {
            const selectedFieldId = field.settings?.selectedFieldId;

            if (!isDefined(selectedFieldId)) {
              return null;
            }

            return (
              <WorkflowFormFieldInput
                key={field.id}
                fieldMetadataId={selectedFieldId}
                defaultValue={field.value}
                readonly={actionOptions.readonly}
                onChange={(value) => {
                  onFieldUpdate({ fieldId: field.id, value });
                }}
              />
            );
          }

          return (
            <FormFieldInput
              key={field.id}
              field={{
                label: field.label,
                type: field.type,
                metadata: {} as FieldMetadata,
              }}
              onChange={(value) => {
                onFieldUpdate({ fieldId: field.id, value });
              }}
              defaultValue={field.value}
              readonly={actionOptions.readonly}
              placeholder={
                field.placeholder ??
                getDefaultFormFieldSettings(field.type).placeholder
              }
              onError={setError}
            />
          );
        })}
      </WorkflowStepBody>
      {!actionOptions.readonly && (
        <SidePanelFooter
          actions={[
            doesInputAskObjectExist ? (
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
