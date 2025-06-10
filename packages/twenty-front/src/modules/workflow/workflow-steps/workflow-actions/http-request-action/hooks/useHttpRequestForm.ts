import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { useState } from 'react';
import { isDefined, isValidUrl } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { METHODS_WITH_BODY } from '../constants/HttpRequest';

export type HttpRequestFormData = {
  url: string;
  method: string;
  headers: string | null;
  body: string | null;
};

export type ErrorMessages = {
  url?: string;
  headers?: string;
  body?: string;
};

export type ErrorMessagesVisible = {
  url: boolean;
  headers: boolean;
  body: boolean;
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
  const [errorMessagesVisible, setErrorMessagesVisible] =
    useState<ErrorMessagesVisible>({
      url: false,
      headers: false,
      body: false,
    });
  const [formData, setFormData] = useState<HttpRequestFormData>({
    url: action.settings.input.url,
    method: action.settings.input.method,
    headers:
      action.settings.input.headers &&
      Object.keys(action.settings.input.headers).length > 0
        ? JSON.stringify(action.settings.input.headers, null, 2)
        : null,
    body: action.settings.input.body
      ? Object.keys(action.settings.input.body).length > 0
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

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setErrorMessages((prev) => ({ ...prev, url: 'URL is required' }));
      return false;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setErrorMessages((prev) => ({
        ...prev,
        url: 'URL must start with http:// or https://',
      }));
      return false;
    }

    if (!isValidUrl(url)) {
      setErrorMessages((prev) => ({
        ...prev,
        url: 'Invalid URL',
      }));
      return false;
    }

    setErrorMessages((prev) => ({ ...prev, url: undefined }));
    return true;
  };

  const saveAction = useDebouncedCallback((formData: HttpRequestFormData) => {
    if (readonly) {
      return;
    }

    let parsedHeaders: Record<string, string> | undefined = undefined;
    let parsedBody: Record<string, unknown> | undefined = undefined;

    if (isDefined(formData.headers)) {
      try {
        parsedHeaders = JSON.parse(formData.headers);
      } catch {
        parsedHeaders = undefined;
      }
    }

    if (
      ['POST', 'PUT', 'PATCH'].includes(formData.method) &&
      isDefined(formData.body)
    ) {
      try {
        parsedBody = JSON.parse(formData.body);
      } catch {
        parsedBody = undefined;
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
    let newFormData = { ...formData, [field]: value ?? '' };

    if (field === 'url' && !validateUrl(value ?? '')) {
      return;
    }

    if (
      field === 'method' &&
      !METHODS_WITH_BODY.includes(value as (typeof METHODS_WITH_BODY)[number])
    ) {
      newFormData = { ...newFormData, body: null };
    }

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

  const onBlur = (field: 'url' | 'headers' | 'body') => {
    setErrorMessagesVisible((prev) => ({
      ...prev,
      [field]: Boolean(formData[field]),
    }));
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
