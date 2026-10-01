import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type WorkflowSendChatMessageAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

type SendChatMessageFormData =
  WorkflowSendChatMessageAction['settings']['input'];

type WorkflowEditActionSendChatMessageProps = {
  action: WorkflowSendChatMessageAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowSendChatMessageAction) => void;
      };
};

export const WorkflowEditActionSendChatMessage = ({
  action,
  actionOptions,
}: WorkflowEditActionSendChatMessageProps) => {
  const [formData, setFormData] = useState<SendChatMessageFormData>(
    action.settings.input,
  );

  const saveAction = useDebouncedCallback(
    (nextFormData: SendChatMessageFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: nextFormData,
        },
      });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleFieldChange = (
    fieldName: keyof SendChatMessageFormData,
    value: string,
  ) => {
    const nextFormData = { ...formData, [fieldName]: value };

    setFormData(nextFormData);
    saveAction(nextFormData);
  };

  return (
    <>
      <WorkflowStepBody>
        <FormSingleRecordPicker
          label={t`Recipient`}
          objectNameSingulars={[CoreObjectNameSingular.WorkspaceMember]}
          defaultValue={formData.workspaceMemberId}
          onChange={(workspaceMemberId) =>
            handleFieldChange('workspaceMemberId', workspaceMemberId ?? '')
          }
          disabled={actionOptions.readonly}
          testId="workflow-edit-action-send-chat-message-recipient"
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Conversation title`}
          placeholder={t`Defaults to the step name`}
          readonly={actionOptions.readonly}
          defaultValue={formData.title}
          onChange={(value) => handleFieldChange('title', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Message`}
          placeholder={t`Enter the message to post`}
          multiline
          readonly={actionOptions.readonly}
          defaultValue={formData.text}
          onChange={(value) => handleFieldChange('text', value)}
          VariablePicker={WorkflowVariablePicker}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
