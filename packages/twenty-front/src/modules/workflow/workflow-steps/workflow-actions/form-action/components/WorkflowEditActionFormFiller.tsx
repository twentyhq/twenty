import { CmdEnterActionButton } from '@/action-menu/components/CmdEnterActionButton';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/form-types/components/FormSingleRecordPicker';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { useWorkflowStepContextOrThrow } from '@/workflow/states/context/WorkflowStepContext';
import { WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useUpdateWorkflowRunStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowRunStep';
import { useSubmitFormStep } from '@/workflow/workflow-steps/workflow-actions/form-action/hooks/useSubmitFormStep';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
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
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { submitFormStep } = useSubmitFormStep();
  const [formData, setFormData] = useState<FormData>(action.settings.input);
  const { workflowRunId } = useWorkflowStepContextOrThrow();
  const { goBackFromCommandMenu } = useCommandMenuHistory();
  const { updateWorkflowRunStep } = useUpdateWorkflowRunStep();
  const [error, setError] = useState<string | undefined>(undefined);
  const canSubmit = !actionOptions.readonly && !isDefined(error);

  if (!isDefined(workflowRunId)) {
    throw new Error('Form filler action must be used in a workflow run');
  }

  const headerTitle = isDefined(action.name) ? action.name : `Form`;
  const headerIcon = getActionIcon(action.type);

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
      <WorkflowStepHeader
        Icon={getIcon(headerIcon)}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType="Action"
        disabled
      />
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
                objectNameSingular={objectNameSingular}
                disabled={actionOptions.readonly}
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
              title="Submit"
              onClick={onSubmit}
              disabled={!canSubmit}
            />,
          ]}
        />
      )}
    </>
  );
};
