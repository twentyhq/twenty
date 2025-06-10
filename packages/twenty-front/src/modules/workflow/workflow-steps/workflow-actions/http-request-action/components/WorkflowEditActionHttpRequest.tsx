import { FormRawJsonFieldInput } from '@/object-record/record-field/form-types/components/FormRawJsonFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useEffect } from 'react';
import { useIcons } from 'twenty-ui/display';
import {
  DEFAULT_BODY_PLACEHOLDER,
  DEFAULT_HEADERS_PLACEHOLDER,
  HTTP_METHODS,
  METHODS_WITH_BODY,
} from '../constants/HttpRequest';
import { useHttpRequestForm } from '../hooks/useHttpRequestForm';

type WorkflowEditActionHttpRequestProps = {
  action: WorkflowHttpRequestAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowHttpRequestAction) => void;
      };
};

export const WorkflowEditActionHttpRequest = ({
  action,
  actionOptions,
}: WorkflowEditActionHttpRequestProps) => {
  const { getIcon } = useIcons();
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'HTTP Request',
    });

  const {
    formData,
    errorMessages,
    errorMessagesVisible,
    handleFieldChange,
    onBlur,
    saveAction,
  } = useHttpRequestForm({
    action,
    onActionUpdate:
      actionOptions.readonly === true
        ? undefined
        : actionOptions.onActionUpdate,
    readonly: actionOptions.readonly === true,
  });

  useEffect(() => () => saveAction.flush(), [saveAction]);

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
        <FormTextFieldInput
          label="Live URL"
          placeholder="Enter request URL"
          readonly={actionOptions.readonly}
          defaultValue={formData.url}
          onChange={(value) => handleFieldChange('url', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <Select
          dropdownId="select-http-method"
          label="HTTP method"
          options={HTTP_METHODS}
          value={formData.method}
          onChange={(value) => handleFieldChange('method', value)}
          disabled={actionOptions.readonly}
        />
        <FormRawJsonFieldInput
          label="Headers"
          placeholder={DEFAULT_HEADERS_PLACEHOLDER}
          readonly={actionOptions.readonly}
          defaultValue={formData.headers}
          error={
            errorMessagesVisible.headers ? errorMessages.headers : undefined
          }
          onBlur={() => onBlur('headers')}
          onChange={(value) => handleFieldChange('headers', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        {METHODS_WITH_BODY.includes(
          formData.method as (typeof METHODS_WITH_BODY)[number],
        ) && (
          <FormRawJsonFieldInput
            label="Body"
            placeholder={DEFAULT_BODY_PLACEHOLDER}
            readonly={actionOptions.readonly}
            defaultValue={formData.body}
            error={errorMessagesVisible.body ? errorMessages.body : undefined}
            onBlur={() => onBlur('body')}
            onChange={(value) => handleFieldChange('body', value)}
            VariablePicker={WorkflowVariablePicker}
          />
        )}
      </WorkflowStepBody>
    </>
  );
};
