import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { getBodyTypeFromHeaders } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getBodyTypeFromHeaders';
import { isMethodWithBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/isMethodWithBody';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  type HttpRequestBody,
  type HttpRequestFormData,
} from '../constants/HttpRequest';

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
    bodyType: action.settings.input.bodyType,
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
          bodyType: formData.bodyType,
        },
      },
    });
  }, 500);

  const handleFieldChange = (
    field: keyof HttpRequestFormData,
    value: string | HttpRequestBody | undefined,
  ) => {
    let newFormData = { ...formData, [field]: value };

    if (
      (field === 'method' && !isMethodWithBody(value as string)) ||
      (field === 'bodyType' && formData.bodyType !== value)
    ) {
      newFormData = { ...newFormData, body: undefined };
      if (field === 'method') {
        newFormData = { ...newFormData, bodyType: undefined };
      }
    }

    if (field === 'headers' && !newFormData.body) {
      const bodyTypeValue = getBodyTypeFromHeaders(newFormData.headers);
      if (isDefined(bodyTypeValue)) {
        newFormData = { ...newFormData, bodyType: bodyTypeValue };
      }
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
