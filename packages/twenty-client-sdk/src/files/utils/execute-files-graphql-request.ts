import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';

type ProcessEnvironment = Record<string, string | undefined>;

const getProcessEnvironment = (): ProcessEnvironment => {
  const processObject = (
    globalThis as { process?: { env?: ProcessEnvironment } }
  ).process;

  return processObject?.env ?? {};
};

export const executeFilesGraphqlRequest = async <TData>({
  endpointPath,
  body,
  caller,
}: {
  endpointPath: '/graphql' | '/metadata';
  body: FormData | string;
  caller: string;
}): Promise<TData> => {
  const processEnvironment = getProcessEnvironment();
  const apiUrl = processEnvironment[DEFAULT_API_URL_NAME];
  const accessToken =
    processEnvironment[DEFAULT_APP_ACCESS_TOKEN_NAME] ??
    processEnvironment[DEFAULT_API_KEY_NAME];

  if (!apiUrl || !accessToken) {
    throw new Error(
      `${caller}() requires the app runtime env vars ` +
        `${DEFAULT_API_URL_NAME} and ${DEFAULT_APP_ACCESS_TOKEN_NAME}.`,
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}${endpointPath}`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(
      `${caller}() failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const responseBody = (await response.json()) as {
    data?: TData;
    errors?: { message: string }[];
  };

  if (responseBody.errors && responseBody.errors.length > 0) {
    throw new Error(
      `${caller}() failed: ${responseBody.errors
        .map((error) => error.message)
        .join(', ')}`,
    );
  }

  if (!responseBody.data) {
    throw new Error(`${caller}() failed: response contained no data.`);
  }

  return responseBody.data;
};
