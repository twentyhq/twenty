import { CmdEnterActionButton } from '@/action-menu/components/CmdEnterActionButton';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useUpdateWorkflowRunStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowRunStep';
import { WorkflowFormFieldInput } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowFormFieldInput';
import { useSubmitFormStep } from '@/workflow/workflow-steps/workflow-actions/form-action/hooks/useSubmitFormStep';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
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
  const { submitFormStep } = useSubmitFormStep();
  const [formData, setFormData] = useState<FormData>(action.settings.input);
  const workflowRunId = useWorkflowRunIdOrThrow();
  const { goBackFromCommandMenu } = useCommandMenuHistory();
  const { updateWorkflowRunStep } = useUpdateWorkflowRunStep();
  const [error, setError] = useState<string | undefined>(undefined);

  const canSubmit = !actionOptions.readonly && !isDefined(error);

  const onFieldUpdate = ({
    fieldId,
    value,
  }: {
    fieldId: string;
    value: any;
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

  const onSubmit = async () => {
    const response = formData.reduce(
      (acc, field) => {
        acc[field.name] = field.value;
        return acc;
      },
      {} as Record<string, any>,
    );

    await submitFormStep({
      stepId: action.id,
      workflowRunId,
      response,
    });

    goBackFromCommandMenu();
  };

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  return (
    <>
      <WorkflowStepBody>
        {formData.map((field) => {
          if (field.type === 'RECORD') {
            const objectNameSingular = field.settings?.objectName;

            if (!isDefined(objectNameSingular)) {
              return null;
            }

            const recordId = field.value?.id;

            return (
              <FormSingleRecordPicker
                key={field.id}
                label={field.label}
                defaultValue={recordId}
                onChange={(recordId) => {
                  onFieldUpdate({
                    fieldId: field.id,
                    value: {
                      id: recordId,
                    },
                  });
                }}
                objectNameSingulars={[objectNameSingular]}
                disabled={actionOptions.readonly}
              />
            );
          }

          if (field.type === 'SELECT') {
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
                  onFieldUpdate({
                    fieldId: field.id,
                    value,
                  });
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
                onFieldUpdate({
                  fieldId: field.id,
                  value,
                });
              }}
              defaultValue={field.value}
              readonly={actionOptions.readonly}
              placeholder={
                field.placeholder ??
                getDefaultFormFieldSettings(field.type).placeholder
              }
              onError={(error) => {
                setError(error);
              }}
            />
          );
        })}
      </WorkflowStepBody>
      {!actionOptions.readonly && (
        <RightDrawerFooter
          actions={[
            <CmdEnterActionButton
              title={t`Submit`}
              onClick={onSubmit}
              disabled={!canSubmit}
            />,
          ]}
        />
      )}
    </>
  );
};
