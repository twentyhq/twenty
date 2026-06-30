import { isDefined } from 'src/utils/is-defined';

const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql';

type FirefliesApiSuccess<TData> = {
  ok: true;
  status: number;
  data: TData;
};

type FirefliesApiFailure = {
  ok: false;
  status: number;
  errorMessage: string;
};

export type FirefliesApiResult<TData> =
  | FirefliesApiSuccess<TData>
  | FirefliesApiFailure;

type FirefliesGraphqlError = {
  message?: string;
  extensions?: {
    code?: string;
  };
};

type FirefliesGraphqlEnvelope<TData> = {
  data?: TData;
  errors?: FirefliesGraphqlError[];
};

type FirefliesApiRequestParams = {
  apiKey: string;
  query: string;
  variables?: Record<string, unknown>;
};

export const firefliesApiRequest = async <TData = unknown>({
  apiKey,
  query,
  variables,
}: FirefliesApiRequestParams): Promise<FirefliesApiResult<TData>> => {
  let response: Response;

  try {
    response = await fetch(FIREFLIES_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      errorMessage: `Fireflies API request failed: ${(error as Error).message}`,
    };
  }

  let envelope: FirefliesGraphqlEnvelope<TData> | null = null;
  let parseError: Error | null = null;

  try {
    envelope = (await response.json()) as FirefliesGraphqlEnvelope<TData>;
  } catch (error) {
    parseError = error as Error;
  }

  if (
    envelope !== null &&
    isDefined(envelope.errors) &&
    envelope.errors.length > 0
  ) {
    return {
      ok: false,
      status: response.status,
      errorMessage: `Fireflies GraphQL error: ${formatFirefliesGraphqlError(
        envelope.errors[0],
      )}`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      errorMessage: `Fireflies API responded with HTTP ${response.status}`,
    };
  }

  if (parseError !== null) {
    return {
      ok: false,
      status: response.status,
      errorMessage: `Fireflies API returned a non-JSON response: ${parseError.message}`,
    };
  }

  if (envelope === null || !isDefined(envelope.data)) {
    return {
      ok: false,
      status: response.status,
      errorMessage: 'Fireflies GraphQL response was missing a `data` field',
    };
  }

  return { ok: true, status: response.status, data: envelope.data };
};

const formatFirefliesGraphqlError = (
  error: FirefliesGraphqlError | undefined,
): string => {
  const message = error?.message ?? 'Unknown Fireflies GraphQL error';
  const code = error?.extensions?.code;

  return isDefined(code)
    ? `${message} (Fireflies error code ${code})`
    : message;
};
