import { type HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import { type HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { resolveInput } from 'twenty-shared/utils';
import {
  bodyParsersHttpRequestStep,
  type BodyType,
  CONTENT_TYPE_VALUES_HTTP_REQUEST,
} from 'twenty-shared/workflow';

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

  const callFetchRequest = async (
    url: string,
    headers: Record<string, string>,
    method: string,
    body?: any,
    bodyType?: BodyType,
  ): Promise<HttpRequestTestData['output']> => {
    const requestOptions: RequestInit = {
      method: method,
      headers: headers as Record<string, string>,
    };
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (body !== undefined) {
        requestOptions.body = bodyParsersHttpRequestStep(bodyType, body);

        if (
          !Object.keys(headers).some(
            (key) => key.toLowerCase() === 'content-type',
          ) &&
          bodyType !== 'FormData'
        ) {
          requestOptions.headers = {
            ...requestOptions.headers,
            ...{
              'content-type':
                bodyType && bodyType !== 'None'
                  ? CONTENT_TYPE_VALUES_HTTP_REQUEST[bodyType] ||
                    'application/json'
                  : 'application/json',
            },
          };
        }
      }
    }

    const response = await fetch(url as string, requestOptions);

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

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      error: undefined,
    };
  };
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

      const output = await callFetchRequest(
        substitutedUrl as string,
        substitutedHeaders as Record<string, string>,
        httpRequestFormData.method,
        substitutedBody,
        httpRequestFormData.bodyType,
      );

      const contentType = output?.headers?.['content-type'];
      const language = contentType?.includes('application/json')
        ? 'json'
        : 'plaintext';
      const duration = Date.now() - startTime;
      const outputWithDuration = {
        ...output,
        duration,
      };
      setHttpRequestTestData((prev) => ({
        ...prev,
        output: outputWithDuration,
        language,
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
