import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { isMethodWithBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/isMethodWithBody';
import { useState } from 'react';
import { isValidUrl } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { HttpRequestFormData } from '../constants/HttpRequest';

export type UseHttpRequestFormParams = {
  action: WorkflowHttpRequestAction;
  onActionUpdate?: (action: WorkflowHttpRequestAction) => void;
  readonly: boolean;
};

export const useHttpRequestForm = ({
  action,
  onActionUpdate,
  readonly,
}: UseHttpRequestFormParams) => {
  const [errorMessages, setErrorMessages] = useState<string | undefined>(
    undefined,
  );
  const [errorMessagesVisible, setErrorMessagesVisible] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<HttpRequestFormData>({
    url: action.settings.input.url,
    method: action.settings.input.method,
    headers: action.settings.input.headers || {},
    body: action.settings.input.body,
  });

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setErrorMessages('URL is required');
      return false;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setErrorMessages('URL must start with http:// or https://');
      return false;
    }

    if (!isValidUrl(url)) {
      setErrorMessages('Invalid URL');
      return false;
    }

    setErrorMessages(undefined);
    return true;
  };

  const saveAction = useDebouncedCallback((formData: HttpRequestFormData) => {
    if (readonly) {
      return;
    }

    onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        input: {
          url: formData.url,
          method: formData.method,
          headers: formData.headers,
          body: formData.body,
        },
      },
    });
  }, 500);

  const handleFieldChange = (
    field: keyof HttpRequestFormData,
    value: string | Record<string, unknown> | null,
  ) => {
    let newFormData = { ...formData, [field]: value ?? '' };

    if (field === 'url' && !validateUrl(value as string)) {
      return;
    }

    if (field === 'method' && !isMethodWithBody(value as string)) {
      newFormData = { ...newFormData, body: undefined };
    }

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const onBlur = () => {
    setErrorMessagesVisible(Boolean(formData.url));
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
