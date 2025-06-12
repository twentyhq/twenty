import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useEffect } from 'react';
import { useIcons } from 'twenty-ui/display';
import { MODEL_PROVIDERS, MODELS } from '../constants/AIAgent';
import { useAiAgentForm } from '../hooks/useAiAgentForm';

type WorkflowEditActionAiAgentProps = {
  action: WorkflowAiAgentAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowAiAgentAction) => void;
      };
};

export const WorkflowEditActionAiAgent = ({
  action,
  actionOptions,
}: WorkflowEditActionAiAgentProps) => {
  const { getIcon } = useIcons();
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'AI Agent',
    });

  const {
    formData,
    errorMessages,
    errorMessagesVisible,
    handleFieldChange,
    onBlur,
    saveAction,
  } = useAiAgentForm({
    action,
    onActionUpdate:
      actionOptions.readonly === true
        ? undefined
        : actionOptions.onActionUpdate,
    readonly: actionOptions.readonly === true,
  });

  useEffect(() => () => saveAction.flush(), [saveAction]);

  const availableModels =
    MODELS[formData.modelProvider as keyof typeof MODELS] || [];

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }
          actionOptions.onActionUpdate?.({ ...action, name: newName });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={actionOptions.readonly}
      />
      <WorkflowStepBody>
        <Select
          dropdownId="select-model-provider"
          label="Model Provider"
          options={MODEL_PROVIDERS}
          value={formData.modelProvider}
          onChange={(value) => handleFieldChange('modelProvider', value)}
          disabled={actionOptions.readonly}
        />
        <Select
          dropdownId="select-model"
          label="Model"
          options={availableModels}
          value={formData.model}
          onChange={(value) => handleFieldChange('model', value)}
          disabled={actionOptions.readonly}
        />
        <FormTextFieldInput
          label="Prompt"
          placeholder="Enter prompt"
          readonly={actionOptions.readonly}
          defaultValue={formData.prompt}
          error={errorMessagesVisible.prompt ? errorMessages.prompt : undefined}
          onBlur={() => onBlur('prompt')}
          onChange={(value) => handleFieldChange('prompt', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label="Response Format"
          placeholder="Enter response format (e.g. 'text', 'json')"
          readonly={actionOptions.readonly}
          defaultValue={formData.responseFormat}
          error={
            errorMessagesVisible.responseFormat
              ? errorMessages.responseFormat
              : undefined
          }
          onBlur={() => onBlur('responseFormat')}
          onChange={(value) => handleFieldChange('responseFormat', value)}
        />
      </WorkflowStepBody>
    </>
  );
};
