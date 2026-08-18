import { type AxiosInstance } from "axios";

type GraphQlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

// Both /metadata and /graphql (workspace records) speak the same envelope.
// Unwraps `data` and throws on GraphQL errors so callers never have to null-check.
export const postGraphql = async <TData>(
  client: AxiosInstance,
  path: '/metadata' | '/graphql',
  operationName: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<TData> => {
  const response = await client.post<GraphQlResponse<TData>>(
    path,
    { operationName, query, variables },
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (response.data.errors !== undefined && response.data.errors.length > 0) {
    throw new Error(
      `GraphQL error in ${operationName}: ${response.data.errors.map((error) => error.message).join('; ')}`,
    );
  }

  if (response.data.data === undefined) {
    throw new Error(`GraphQL response for ${operationName} had no data and no errors`);
  }

  return response.data.data;
};
