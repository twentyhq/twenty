import { createSchema, createYoga } from 'graphql-yoga';

import { useDisableIntrospectionAndSuggestionsWithoutServerAdminAccess } from 'src/engine/core-modules/graphql/hooks/use-disable-introspection-and-suggestions-without-server-admin-access.hook';

const SERVER_ADMIN_WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const FULL_ADMIN = { canAccessFullAdminPanel: true, canImpersonate: false };
const REGULAR_USER = { canAccessFullAdminPanel: false, canImpersonate: false };

const runQuery = async ({
  query,
  isProductionEnvironment = true,
  req,
}: {
  query: string;
  isProductionEnvironment?: boolean;
  req: Record<string, unknown>;
}) => {
  const yoga = createYoga({
    schema: createSchema({
      typeDefs: 'type Query { adminOnlyField: String }',
    }),
    plugins: [
      useDisableIntrospectionAndSuggestionsWithoutServerAdminAccess({
        isProductionEnvironment,
        getServerAdminWorkspaceId: () => SERVER_ADMIN_WORKSPACE_ID,
      }),
    ],
    logging: false,
  });

  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    },
    { req },
  );

  return response.json();
};

const INTROSPECTION_QUERY = '{ __schema { queryType { name } } }';

const expectIntrospectionRefused = (result: {
  data?: unknown;
  errors?: { message: string }[];
}) => {
  expect(result.data).toBeUndefined();
  expect(result.errors?.[0]?.message).toContain(
    'GraphQL introspection has been disabled',
  );
};

describe('useDisableIntrospectionAndSuggestionsWithoutServerAdminAccess', () => {
  it('should allow introspection for a full admin in the server admin workspace', async () => {
    const result = await runQuery({
      query: INTROSPECTION_QUERY,
      req: {
        user: FULL_ADMIN,
        workspace: { id: SERVER_ADMIN_WORKSPACE_ID },
      },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data.__schema.queryType.name).toBe('Query');
  });

  it('should refuse introspection for a full admin in another workspace', async () => {
    const result = await runQuery({
      query: INTROSPECTION_QUERY,
      req: {
        user: FULL_ADMIN,
        workspace: { id: '20202020-0000-4000-8000-000000000002' },
      },
    });

    expectIntrospectionRefused(result);
  });

  it('should refuse introspection for an authenticated user without admin privileges', async () => {
    const result = await runQuery({
      query: INTROSPECTION_QUERY,
      req: {
        user: REGULAR_USER,
        workspace: { id: SERVER_ADMIN_WORKSPACE_ID },
      },
    });

    expectIntrospectionRefused(result);
  });

  it('should refuse introspection for an unauthenticated request', async () => {
    const result = await runQuery({ query: INTROSPECTION_QUERY, req: {} });

    expectIntrospectionRefused(result);
  });

  it('should hide field suggestions from users without admin access', async () => {
    const result = await runQuery({
      query: '{ adminOnlyFiel }',
      req: { user: REGULAR_USER },
    });

    expect(result.errors[0].message).not.toContain('adminOnlyField');
  });

  it('should allow introspection outside production so codegen keeps working', async () => {
    const result = await runQuery({
      query: INTROSPECTION_QUERY,
      isProductionEnvironment: false,
      req: {},
    });

    expect(result.errors).toBeUndefined();
  });
});
