import { HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { resolveInput } from 'twenty-shared/utils';

const convertFlatVariablesToNestedContext = (flatVariables: {
  [variablePath: string]: any;
}): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flatVariables)) {
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
};

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
      const nestedVariableContext =
        convertFlatVariablesToNestedContext(variableValues);
      const substitutedUrl = resolveInput(
        httpRequestFormData.url,
        nestedVariableContext,
      );
      const substitutedHeaders = resolveInput(
        httpRequestFormData.headers,
        nestedVariableContext,
      );
      const substitutedBody = resolveInput(
        httpRequestFormData.body,
        nestedVariableContext,
      );

      const requestOptions: RequestInit = {
        method: httpRequestFormData.method,
        headers: {
          'Content-Type': 'application/json',
          ...(substitutedHeaders as Record<string, string>),
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

      const response = await fetch(substitutedUrl as string, requestOptions);
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
