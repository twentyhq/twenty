import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { isMethodWithBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/isMethodWithBody';
import { useState } from 'react';
import { isValidUrl } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { HttpRequestBody, HttpRequestFormData } from '../constants/HttpRequest';

export type UseHttpRequestFormParams = {
  action: WorkflowHttpRequestAction;
  onActionUpdate?: (action: WorkflowHttpRequestAction) => void;
  readonly: boolean;
};

type ErrorState = {
  message: string | undefined;
  isVisible: boolean;
};

export const useHttpRequestForm = ({
  action,
  onActionUpdate,
  readonly,
}: UseHttpRequestFormParams) => {
  const [error, setError] = useState<ErrorState>({
    message: undefined,
    isVisible: false,
  });
  const [formData, setFormData] = useState<HttpRequestFormData>({
    url: action.settings.input.url,
    method: action.settings.input.method,
    headers: action.settings.input.headers || {},
    body: action.settings.input.body,
  });

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setError({ message: 'URL is required', isVisible: false });
      return false;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError({
        message: 'URL must start with http:// or https://',
        isVisible: false,
      });
      return false;
    }

    if (!isValidUrl(url)) {
      setError({ message: 'Invalid URL', isVisible: false });
      return false;
    }

    setError({ message: undefined, isVisible: false });
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
    value: string | HttpRequestBody | undefined,
  ) => {
    let newFormData = { ...formData, [field]: value };

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
    setError((prev) => ({ ...prev, isVisible: Boolean(formData.url) }));
  };

  return {
    formData,
    error,
    handleFieldChange,
    onBlur,
    saveAction,
  };
};
