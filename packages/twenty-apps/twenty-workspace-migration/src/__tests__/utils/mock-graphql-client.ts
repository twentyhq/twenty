import { type AxiosInstance } from "axios";
import { vi } from "vitest";

type MockCall = {
  path: string;
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
};

// Stands in for an AxiosInstance against postGraphql's exact contract (graphql-client.util.ts):
// `client.post(path, {operationName, query, variables}, {headers})` resolving to
// `{data: {data: <payload>}}`. `responsesByOperation` maps operationName -> the GraphQL
// `data` payload to return for that operation; an operation invoked with no matching entry
// throws, so a test omitting a response is a loud failure instead of a silent `undefined`.
export const createMockGraphqlClient = (
  responsesByOperation: Record<string, unknown>,
) => {
  const calls: MockCall[] = [];

  const post = vi.fn(async (path: string, body: { operationName: string; query: string; variables?: Record<string, unknown> }) => {
    calls.push({ path, operationName: body.operationName, query: body.query, variables: body.variables ?? {} });

    if (!(body.operationName in responsesByOperation)) {
      throw new Error(`No mocked response for operation "${body.operationName}"`);
    }

    return { data: { data: responsesByOperation[body.operationName] } };
  });

  return {
    client: { post } as unknown as AxiosInstance,
    calls,
  };
};
