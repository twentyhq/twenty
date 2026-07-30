import { type CoreApiClient } from 'twenty-client-sdk/core';

export type QueryArgs = Record<string, unknown>;

export type ConnectionPage = {
  edges: { node: Record<string, unknown> }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

export type QueryResponder = (args: QueryArgs) => ConnectionPage;

export type RecordedMutation = { name: string; args: QueryArgs };

export const toPage = (nodes: Record<string, unknown>[]): ConnectionPage => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

export const createCoreApiClientMock = (
  responders: Record<string, QueryResponder>,
) => {
  const mutations: RecordedMutation[] = [];

  const client = {
    query: async (query: Record<string, { __args?: QueryArgs }>) => {
      const [rootField, selection] = Object.entries(query)[0];
      const responder = responders[rootField];

      if (!responder) {
        throw new Error(`Unexpected query on "${rootField}"`);
      }

      return { [rootField]: responder(selection.__args ?? {}) };
    },
    mutation: async (mutation: Record<string, { __args?: QueryArgs }>) => {
      const [name, selection] = Object.entries(mutation)[0];
      const args = selection.__args ?? {};

      mutations.push({ name, args });

      return { [name]: { id: args.id } };
    },
  } as unknown as CoreApiClient;

  return { client, mutations };
};

export const getFilter = (args: QueryArgs): Record<string, unknown> =>
  (args.filter as Record<string, unknown> | undefined) ?? {};

export const getInValues = (
  filter: Record<string, unknown>,
  field: string,
): string[] => {
  const condition = filter[field] as { in?: string[] } | undefined;

  return condition?.in ?? [];
};
