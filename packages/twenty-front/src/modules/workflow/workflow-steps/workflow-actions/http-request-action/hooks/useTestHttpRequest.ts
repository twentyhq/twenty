import { type HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import { type HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';
import { isMethodWithBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/isMethodWithBody';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { resolveInput } from 'twenty-shared/utils';
import { parseDataFromContentType } from 'twenty-shared/workflow';
import { type HttpRequestBody } from '../constants/HttpRequest';

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
    body?: HttpRequestBody | string,
  ): Promise<HttpRequestTestData['output']> => {
    const requestOptions: RequestInit = {
      method,
      headers: headers,
    };

    if (isMethodWithBody(method) && body !== undefined) {
      const contentType = headers['content-type'];

      requestOptions.body = parseDataFromContentType(body, contentType);

      if (contentType === 'multipart/form-data') {
        const headersCopy = { ...headers };
        delete headersCopy['content-type'];
        requestOptions.headers = { ...headersCopy };
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
      const substitutedBodyRaw = resolveInput(
        httpRequestFormData.body,
        nestedVariableContext,
      );

      const substitutedBody: HttpRequestBody | string | undefined =
        typeof substitutedBodyRaw === 'string' ||
        (typeof substitutedBodyRaw === 'object' && substitutedBodyRaw !== null)
          ? substitutedBodyRaw
          : undefined;

      const output = await callFetchRequest(
        substitutedUrl as string,
        substitutedHeaders as Record<string, string>,
        httpRequestFormData.method,
        substitutedBody,
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
