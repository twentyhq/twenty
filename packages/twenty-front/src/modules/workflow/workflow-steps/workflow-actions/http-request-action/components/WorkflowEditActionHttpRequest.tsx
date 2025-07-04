import { FormRawJsonFieldInput } from '@/object-record/record-field/form-types/components/FormRawJsonFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';

import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isMethodWithBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/isMethodWithBody';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { useEffect } from 'react';
import { useIcons } from 'twenty-ui/display';
import {
  HTTP_METHODS,
  JSON_RESPONSE_PLACEHOLDER,
} from '../constants/HttpRequest';
import { useHttpRequestForm } from '../hooks/useHttpRequestForm';
import { useHttpRequestOutputSchema } from '../hooks/useHttpRequestOutputSchema';
import { BodyInput } from './BodyInput';
import { KeyValuePairInput } from './KeyValuePairInput';

type WorkflowEditActionHttpRequestProps = {
  action: WorkflowHttpRequestAction;
  actionOptions: {
    readonly?: boolean;
    onActionUpdate?: (action: WorkflowHttpRequestAction) => void;
  };
};

export const WorkflowEditActionHttpRequest = ({
  action,
  actionOptions,
}: WorkflowEditActionHttpRequestProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'HTTP Request',
    });

  const { formData, handleFieldChange, saveAction } = useHttpRequestForm({
    action,
    onActionUpdate: actionOptions.onActionUpdate,
    readonly: actionOptions.readonly === true,
  });

  const { outputSchema, handleOutputSchemaChange, error } =
    useHttpRequestOutputSchema({
      action,
      onActionUpdate: actionOptions.onActionUpdate,
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
          label="URL"
          placeholder="https://api.example.com/endpoint"
          readonly={actionOptions.readonly}
          defaultValue={formData.url}
          onChange={(value) => handleFieldChange('url', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <Select
          label="HTTP Method"
          dropdownId="http-method"
          options={[...HTTP_METHODS]}
          value={formData.method}
          onChange={(value) => handleFieldChange('method', value)}
          disabled={actionOptions.readonly}
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        <KeyValuePairInput
          label="Headers Input"
          defaultValue={formData.headers}
          onChange={(value) => handleFieldChange('headers', value)}
          readonly={actionOptions.readonly}
          keyPlaceholder="Header name"
          valuePlaceholder="Header value"
        />

        {isMethodWithBody(formData.method) && (
          <BodyInput
            defaultValue={formData.body}
            onChange={(value) => handleFieldChange('body', value)}
            readonly={actionOptions.readonly}
          />
        )}

        <FormRawJsonFieldInput
          label="Expected Response Body"
          placeholder={JSON_RESPONSE_PLACEHOLDER}
          defaultValue={outputSchema}
          onChange={handleOutputSchemaChange}
          readonly={actionOptions.readonly}
          error={error}
        />
      </WorkflowStepBody>
    </>
  );
};
