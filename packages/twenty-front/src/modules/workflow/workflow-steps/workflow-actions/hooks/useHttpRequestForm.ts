import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export type HttpRequestFormData = {
  url: string;
  method: string;
  headers: string | null;
  body: string | null;
};

export type ErrorMessages = {
  headers?: string;
  body?: string;
};

export const useHttpRequestForm = ({
  action,
  onActionUpdate,
  readonly,
}: {
  action: WorkflowHttpRequestAction;
  onActionUpdate?: (action: WorkflowHttpRequestAction) => void;
  readonly: boolean;
}) => {
  const [errorMessages, setErrorMessages] = useState<ErrorMessages>({});
  const [errorMessagesVisible, setErrorMessagesVisible] = useState(false);
  const [formData, setFormData] = useState<HttpRequestFormData>({
    url: action.settings.input.url,
    method: action.settings.input.method,
    headers:
      action.settings.input.headers &&
      Object.keys(action.settings.input.headers).length > 0
        ? JSON.stringify(action.settings.input.headers, null, 2)
        : null,
    body: action.settings.input.body
      ? typeof action.settings.input.body === 'string'
        ? action.settings.input.body
        : Object.keys(action.settings.input.body).length > 0
          ? JSON.stringify(action.settings.input.body, null, 2)
          : null
      : null,
  });

  const validateJson = (
    value: string | null,
    field: 'headers' | 'body',
  ): boolean => {
    if (!value || value === '') {
      return true;
    }
    try {
      JSON.parse(value);
      setErrorMessages((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (e) {
      setErrorMessages((prev) => ({ ...prev, [field]: String(e) }));
      return false;
    }
  };

  const saveAction = useDebouncedCallback((formData: HttpRequestFormData) => {
    if (readonly) {
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

    onActionUpdate?.({
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

  const handleFieldChange = (
    field: keyof HttpRequestFormData,
    value: string | null,
  ) => {
    const newFormData = { ...formData, [field]: value ?? '' };
    setFormData(newFormData);

    if (field === 'headers' && !validateJson(value, 'headers')) {
      return;
    }

    if (
      field === 'body' &&
      ['POST', 'PUT', 'PATCH'].includes(formData.method) &&
      !validateJson(value, 'body')
    ) {
      return;
    }

    saveAction(newFormData);
  };

  const onBlur = () => {
    setErrorMessagesVisible(true);
  };

  return {
    formData,
    errorMessages,
    errorMessagesVisible,
    handleFieldChange,
    onBlur,
    saveAction,
  };
};
