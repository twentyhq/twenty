import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type HttpRequestBody,
  type HttpRequestFormData,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { TEST_HTTP_REQUEST } from '@/workflow/workflow-steps/workflow-actions/http-request-action/graphql/mutations/testHttpRequest';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import { useMutation } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isObject, isString } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined, parseJson, resolveInput } from 'twenty-shared/utils';
import {
  type TestHttpRequestInput,
  type TestHttpRequestMutation,
  type TestHttpRequestMutationVariables,
} from '~/generated-metadata/graphql';

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
  const apolloCoreClient = useApolloCoreClient();
  const [isTesting, setIsTesting] = useState(false);
  const [httpRequestTestData, setHttpRequestTestData] = useRecoilState(
    httpRequestTestDataFamilyState(actionId),
  );

  const [mutate] = useMutation<
    TestHttpRequestMutation,
    TestHttpRequestMutationVariables
  >(TEST_HTTP_REQUEST, {
    client: apolloCoreClient,
  });
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
        isString(substitutedBodyRaw) ||
        (isObject(substitutedBodyRaw) && isDefined(substitutedBodyRaw))
          ? substitutedBodyRaw
          : undefined;

      const input: TestHttpRequestInput = {
        url: substitutedUrl as string,
        method: httpRequestFormData.method,
        headers: substitutedHeaders as Record<string, string>,
        body: substitutedBody,
      };

      const result = await mutate({
        variables: { input },
      });

      const duration = Date.now() - startTime;
      const response = result?.data?.testHttpRequest;

      if (!response) {
        throw new Error('No response from server');
      }

      if (response.success === true) {
        const resultData = isString(response.result)
          ? response.result
          : JSON.stringify(response.result, null, 2);
        const language = isObject(response.result) ? 'json' : 'plaintext';

        setHttpRequestTestData((prev) => ({
          ...prev,
          output: {
            data: resultData,
            status: response.status ?? 200,
            statusText: response.statusText ?? 'OK',
            headers: response.headers ?? {},
            duration,
            error: undefined,
          },
          language,
        }));
      } else {
        throw new Error(
          isString(response.error)
            ? response.error
            : JSON.stringify(response.error),
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      const rawErrorMessage =
        error instanceof Error ? error.message : t`HTTP request failed`;

      const jsonParsedErrorMessage = parseJson(rawErrorMessage);

      const errorMessage = isDefined(jsonParsedErrorMessage)
        ? JSON.stringify(jsonParsedErrorMessage, null, 2)
        : rawErrorMessage;

      const language = isDefined(jsonParsedErrorMessage) ? 'json' : 'plaintext';

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
        language,
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
