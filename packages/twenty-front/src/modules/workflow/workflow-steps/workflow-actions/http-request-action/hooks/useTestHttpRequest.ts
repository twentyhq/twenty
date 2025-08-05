import { HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import { substituteWorkflowVariables } from '@/workflow/workflow-variables/utils/substituteWorkflowVariables';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

export const useTestHttpRequest = (actionId: string) => {
  const [isTesting, setIsTesting] = useState(false);
  const [httpRequestTestData, setHttpRequestTestData] = useRecoilState(
    httpRequestTestDataFamilyState(actionId),
  );

  const testHttpRequest = async (
    httpRequestFormData: HttpRequestFormData,
    variableValues: { [variablePath: string]: any },
  ) => {
    setIsTesting(true);
    const startTime = Date.now();

    try {
      // Substitute variables in the request configuration
      const substitutedUrl = substituteWorkflowVariables(
        httpRequestFormData.url,
        variableValues,
      );
      const substitutedHeaders = substituteWorkflowVariables(
        httpRequestFormData.headers,
        variableValues,
      );
      const substitutedBody = substituteWorkflowVariables(
        httpRequestFormData.body,
        variableValues,
      );

      const requestOptions: RequestInit = {
        method: httpRequestFormData.method,
        headers: {
          'Content-Type': 'application/json',
          ...substitutedHeaders,
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(httpRequestFormData.method)) {
        if (substitutedBody !== undefined) {
          if (typeof substitutedBody === 'string') {
            requestOptions.body = substitutedBody;
          } else {
            requestOptions.body = JSON.stringify(substitutedBody);
          }
        }
      }

      const response = await fetch(substitutedUrl, requestOptions);
      const duration = Date.now() - startTime;

      let responseData: string;
      const contentType = response.headers.get('content-type');

      if (contentType !== null && contentType.includes('application/json')) {
        const jsonData = await response.json();
        responseData = JSON.stringify(jsonData, null, 2);
      } else {
        responseData = await response.text();
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setHttpRequestTestData((prev) => ({
        ...prev,
        output: {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          duration,
          error: undefined,
        },
        language:
          contentType !== null && contentType.includes('application/json')
            ? 'json'
            : 'plaintext',
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'HTTP request failed';

      setHttpRequestTestData((prev) => ({
        ...prev,
        output: {
          data: undefined,
          status: undefined,
          statusText: undefined,
          headers: {},
          duration,
          error: errorMessage,
        },
        language: 'plaintext',
      }));
    } finally {
      setIsTesting(false);
    }
  };

  return {
    testHttpRequest,
    isTesting,
    httpRequestTestData,
  };
};
