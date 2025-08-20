import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { HTTP_REQUEST_MUTATION } from '@/workflow/workflow-steps/workflow-actions/http-request-action/graphqlMutation/httpRequestMutation';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import { type HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined, resolveInput } from 'twenty-shared/utils';
import {
  type MutationTestHttpRequestArgs,
  type TestHttpResponseDto,
} from '~/generated-metadata/graphql';
import { type BodyType } from '../constants/HttpRequest';

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
type TestHttpRequestMutationResult = {
  testHttpRequest: TestHttpResponseDto;
};
export const useTestHttpRequest = (actionId: string) => {
  const [isTesting, setIsTesting] = useState(false);
  const [httpRequestTestData, setHttpRequestTestData] = useRecoilState(
    httpRequestTestDataFamilyState(actionId),
  );
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation<
    TestHttpRequestMutationResult,
    MutationTestHttpRequestArgs
  >(HTTP_REQUEST_MUTATION, {
    client: apolloCoreClient,
  });
  const callGraphQLMutation = async (
    url: string,
    headers: Record<string, string>,
    body: any,
    method: string,
    bodyType?: string,
  ): Promise<HttpRequestTestData['output']> => {
    const result = await mutate({
      variables: {
        input: {
          input: { url, headers, body, method, bodyType },
        },
      },
    });
    const data = result.data?.testHttpRequest;

    if (isDefined(data?.error)) throw new Error(data.error);

    return {
      data: data?.data,
      status: data?.status,
      statusText: data?.statusText,
      headers: data?.headers || {},
      error: undefined,
    };
  };
  const callFetchRequest = async (
    url: string,
    headers: Record<string, string>,
    method: string,
    body?: any,
    bodyType?: BodyType,
  ): Promise<HttpRequestTestData['output']> => {
    let defaultContentType: string | undefined;
    const isMethodWithBodyAndNoEmpty =
    ['POST', 'PUT', 'PATCH'].includes(method) &&isDefined( body);
    if (isMethodWithBodyAndNoEmpty && isDefined(bodyType)) {
      if (bodyType === 'rawJson' || bodyType === 'keyValue') {
        defaultContentType = 'application/json';
      } else if (bodyType === 'Text') {
        defaultContentType = 'text/plain';
      }
    }
    const requestOptions: RequestInit = {
      method: method,
      headers:{
      ...(defaultContentType ? { 'content-type': defaultContentType } : {}),
      ...headers
      }
    };

    if (isMethodWithBodyAndNoEmpty) {
      requestOptions.body =
        typeof body === 'string' ? body : JSON.stringify(body);
    }
    const result = await fetch(url, requestOptions);

    let responseData: string;
    const contentType = result.headers.get('content-type');

    if (contentType?.includes('application/json') === true) {
      const jsonData = await result.json();
      responseData = JSON.stringify(jsonData, null, 2);
    } else {
      responseData = await result.text();
    }

    const responseHeaders: Record<string, string> = {};
    result.headers.forEach((value, key) => (responseHeaders[key] = value));

    return {
      data: responseData,
      status: result.status,
      statusText: result.statusText,
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
      let output: HttpRequestTestData['output'];

      if (
        httpRequestFormData.bodyType === 'FormData' &&
        ['POST', 'PUT', 'PATCH'].includes(httpRequestFormData.method)
      ) {
        output = await callGraphQLMutation(
          substitutedUrl as string,
          substitutedHeaders as Record<string, string>,
          substitutedBody,
          httpRequestFormData.method,
          httpRequestFormData.bodyType,
        );
      } else {
        output = await callFetchRequest(
          substitutedUrl as string,
          substitutedHeaders as Record<string, string>,
          httpRequestFormData.method,
          substitutedBody,
          httpRequestFormData.bodyType,
        );
      }
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
