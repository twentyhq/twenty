import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { isMethodWithBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/isMethodWithBody';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  type HttpRequestBody,
  type HttpRequestFormData,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';

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
  const [formData, setFormData] = useState<HttpRequestFormData>({
    url: action.settings.input.url,
    method: action.settings.input.method,
    headers: action.settings.input.headers || {},
    body: action.settings.input.body,
  });

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

    if (field === 'method' && !isMethodWithBody(value as string)) {
      const headersCopy = { ...formData.headers };
      delete headersCopy?.['content-type'];
      newFormData = { ...newFormData, body: undefined, headers: headersCopy };
    } else if (
      field === 'headers' &&
      typeof value === 'object' &&
      formData.headers?.['content-type'] !== value?.['content-type']
    ) {
      newFormData = { ...newFormData, body: undefined };
    }
    setFormData(newFormData);
    saveAction(newFormData);
  };
  return {
    formData,
    handleFieldChange,
    saveAction,
  };
};
