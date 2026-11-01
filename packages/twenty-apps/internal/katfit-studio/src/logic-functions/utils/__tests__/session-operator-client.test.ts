import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionOperatorClient } from '../../../../scripts/session-operator-client.mjs';
const environment = {
  STUDIO_OPERATOR_CRM_URL: 'https://crm.example.test',
  STUDIO_OPERATOR_API_TOKEN: 'secret',
};

test('operator transport sends bounded queries and refuses arbitrary mutations', async () => {
  const requests: { url: string; options: RequestInit }[] = [];
  const client = createSessionOperatorClient(
    environment,
    async (url: URL, options: RequestInit) => {
      requests.push({ url: String(url), options });
      return new Response(
        JSON.stringify({
          data: {
            studioMemberships: { edges: [], pageInfo: { hasNextPage: false } },
          },
        }),
      );
    },
  );
  await client.query({
    studioMemberships: { __args: { filter: { id: { eq: 'id' } } } },
  });
  assert.equal(requests[0].url, 'https://crm.example.test/graphql');
  assert.equal(requests[0].options.redirect, 'error');
  assert.match(
    JSON.parse(String(requests[0].options.body)).query,
    /^query InspectResource/,
  );
  await assert.rejects(() =>
    client.mutation({
      updateClassSessions: {
        __args: { filter: { id: { eq: 'id' } }, data: { status: 'CANCELLED' } },
      },
    }),
  );
  assert.equal(requests.length, 1);
});

test('operator transport allows only exact-owner null release', async () => {
  let payload: { query: string; variables: unknown } | undefined;
  const client = createSessionOperatorClient(
    environment,
    async (_url: URL, options: RequestInit) => {
      payload = JSON.parse(String(options.body));
      return new Response(
        JSON.stringify({ data: { updateStudioMemberships: [] } }),
      );
    },
  );
  const filter = {
    and: [{ id: { eq: 'id' } }, { mutationLock: { eq: 'owner' } }],
  };
  await client.mutation({
    updateStudioMemberships: {
      __args: { filter, data: { mutationLock: null } },
    },
  });
  assert.match(payload!.query, /mutation ReleaseTerminalOwner/);
  assert.deepEqual(payload!.variables, {
    filter,
    data: { mutationLock: null },
  });
});

test('operator transport rejects URL credentials and redirects before network use', () => {
  assert.throws(() =>
    createSessionOperatorClient({
      ...environment,
      STUDIO_OPERATOR_CRM_URL: 'https://user:pass@crm.example.test',
    }),
  );
  assert.throws(() =>
    createSessionOperatorClient({
      ...environment,
      STUDIO_OPERATOR_CRM_URL: 'http://crm.example.test',
    }),
  );
});
