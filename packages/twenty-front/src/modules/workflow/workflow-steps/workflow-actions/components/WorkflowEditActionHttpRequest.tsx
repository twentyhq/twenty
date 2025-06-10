import { FormRawJsonFieldInput } from '@/object-record/record-field/form-types/components/FormRawJsonFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';

const HTTP_METHODS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
];

type WorkflowEditActionHttpRequestProps = {
  action: WorkflowHttpRequestAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowHttpRequestAction) => void;
      };
};

type HttpRequestFormData = {
  url: string;
  method: string;
  headers: string | null;
  body: string | null;
};

type ErrorMessages = {
  headers?: string;
  body?: string;
};

export const WorkflowEditActionHttpRequest = ({
  action,
  actionOptions,
}: WorkflowEditActionHttpRequestProps) => {
  const { getIcon } = useIcons();
  const headerTitle = action.name || 'HTTP Request';
  const headerIcon = getActionIcon(action.type);
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);

  const [errorMessages, setErrorMessages] = useState<ErrorMessages>({});
  const [errorMessagesVisible, setErrorMessagesVisible] = useState(false);

  const [formData, setFormData] = useState<HttpRequestFormData>({
    url: action.settings.input.url,
    method: action.settings.input.method,
    headers: action.settings.input.headers
      ? JSON.stringify(action.settings.input.headers, null, 2)
      : null,
    body: action.settings.input.body
      ? typeof action.settings.input.body === 'string'
        ? action.settings.input.body
        : JSON.stringify(action.settings.input.body, null, 2)
      : null,
  });

  const saveAction = useDebouncedCallback((formData: HttpRequestFormData) => {
    if (actionOptions.readonly === true) {
      return;
    }

    let parsedHeaders: Record<string, string> | undefined = undefined;
    let parsedBody: Record<string, unknown> | string | undefined = undefined;

    if (isDefined(formData.headers)) {
      try {
        parsedHeaders = JSON.parse(formData.headers);
      } catch {
        return;
      }
    }

    if (
      ['POST', 'PUT', 'PATCH'].includes(formData.method) &&
      isDefined(formData.body)
    ) {
      try {
        parsedBody = JSON.parse(formData.body);
      } catch {
        parsedBody = formData.body;
      }
    }

    actionOptions.onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        input: {
          url: formData.url,
          method: formData.method as any,
          headers: parsedHeaders,
          body: parsedBody,
        },
      },
    });
  }, 500);

  useEffect(() => () => saveAction.flush(), [saveAction]);

  const handleFieldChange = (
    field: keyof HttpRequestFormData,
    value: string | null,
  ) => {
    const newFormData = { ...formData, [field]: value ?? '' };
    setFormData(newFormData);

    if (field === 'headers' && value !== null && value !== '') {
      try {
        JSON.parse(value);
        setErrorMessages((prev) => ({ ...prev, headers: undefined }));
      } catch (e) {
        setErrorMessages((prev) => ({ ...prev, headers: String(e) }));
        return;
      }
    }

    if (
      field === 'body' &&
      value !== null &&
      value !== '' &&
      ['POST', 'PUT', 'PATCH'].includes(formData.method)
    ) {
      try {
        JSON.parse(value);
        setErrorMessages((prev) => ({ ...prev, body: undefined }));
      } catch (e) {
        setErrorMessages((prev) => ({ ...prev, body: String(e) }));
        return;
      }
    }

    saveAction(newFormData);
  };

  const onBlur = () => {
    setErrorMessagesVisible(true);
  };

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
          onChange={(v) => handleFieldChange('url', v)}
        />
        <Select
          dropdownId="select-http-method"
          label="HTTP method"
          options={HTTP_METHODS}
          value={formData.method}
          onChange={(v) => handleFieldChange('method', v as string)}
          disabled={actionOptions.readonly}
        />
        <FormRawJsonFieldInput
          label="Headers"
          placeholder={'{\n  "Authorization": "Bearer ..."\n}'}
          readonly={actionOptions.readonly}
          defaultValue={formData.headers}
          error={errorMessagesVisible ? errorMessages.headers : undefined}
          onBlur={onBlur}
          onChange={(v) => handleFieldChange('headers', v)}
        />
        {['POST', 'PUT', 'PATCH'].includes(formData.method) && (
          <FormRawJsonFieldInput
            label="Body"
            placeholder={'{\n  "key": "value"\n}'}
            readonly={actionOptions.readonly}
            defaultValue={formData.body}
            error={errorMessagesVisible ? errorMessages.body : undefined}
            onBlur={onBlur}
            onChange={(v) => handleFieldChange('body', v)}
          />
        )}
      </WorkflowStepBody>
    </>
  );
};
