import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type WorkflowSendChatMessageAction } from '@/workflow/types/Workflow';
import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

type SendChatMessageFormData =
  WorkflowSendChatMessageAction['settings']['input'];

type SendChatMessageToolCall = NonNullable<SendChatMessageFormData['toolCall']>;

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
  const { toolIndex } = useGetToolIndex();
  const [formData, setFormData] = useState<SendChatMessageFormData>(
    action.settings.input,
  );
  const [toolArgumentsError, setToolArgumentsError] = useState<
    string | undefined
  >(undefined);

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

  const updateFormData = (nextFormData: SendChatMessageFormData) => {
    setFormData(nextFormData);
    saveAction(nextFormData);
  };

  const handleFieldChange = (
    fieldName: 'workspaceMemberId' | 'title' | 'text',
    value: string,
  ) => {
    updateFormData({ ...formData, [fieldName]: value });
  };

  const handleToolCallChange = (toolCall: SendChatMessageToolCall | null) => {
    updateFormData({ ...formData, toolCall: toolCall ?? undefined });
  };

  const handleToolNameChange = (toolName: string) => {
    setToolArgumentsError(undefined);
    // another tool takes other arguments
    handleToolCallChange(toolName === '' ? null : { toolName, arguments: {} });
  };

  // variables sit inside JSON strings, so arguments are saved only once they parse
  const handleToolArgumentsChange = (value: string | null) => {
    const toolName = formData.toolCall?.toolName;

    if (!isDefined(toolName)) {
      return;
    }

    const parsedArguments = parseAndValidateVariableFriendlyStringifiedJson(
      isNonEmptyString(value) ? value : '{}',
    );

    if (!parsedArguments.isValid) {
      setToolArgumentsError(t`Arguments must be a valid JSON object.`);

      return;
    }

    setToolArgumentsError(undefined);
    handleToolCallChange({
      toolName,
      arguments: parsedArguments.data as SendChatMessageToolCall['arguments'],
    });
  };

  const storedToolName = formData.toolCall?.toolName;
  const toolOptions = useMemo(() => {
    const indexedToolOptions = toolIndex.map((toolIndexEntry) => ({
      label: toolIndexEntry.label,
      value: toolIndexEntry.name,
    }));

    // a saved tool the editor cannot see still runs, so it stays shown rather than reading as none
    return isDefined(storedToolName) &&
      !indexedToolOptions.some((option) => option.value === storedToolName)
      ? [
          ...indexedToolOptions,
          {
            label: t`${storedToolName} (not available to you)`,
            value: storedToolName,
          },
        ]
      : indexedToolOptions;
  }, [toolIndex, storedToolName]);

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
        <Select
          dropdownId={`workflow-send-chat-message-tool-${action.id}`}
          label={t`Action to approve`}
          fullWidth
          disabled={actionOptions.readonly}
          value={formData.toolCall?.toolName ?? ''}
          emptyOption={{ label: t`None, only send the message`, value: '' }}
          options={toolOptions}
          onChange={handleToolNameChange}
          withSearchInput
          dropdownSideOffset={4}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
        {isDefined(formData.toolCall) && (
          <FormRawJsonFieldInput
            key={formData.toolCall.toolName}
            label={t`Action arguments`}
            placeholder={t`Enter the arguments as a JSON object`}
            defaultValue={JSON.stringify(formData.toolCall.arguments, null, 2)}
            onChange={handleToolArgumentsChange}
            error={toolArgumentsError}
            readonly={actionOptions.readonly}
            VariablePicker={WorkflowVariablePicker}
          />
        )}
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
