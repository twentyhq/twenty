import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildSchema,
  graphql,
  type ExecutionResult,
  type GraphQLSchema,
} from 'graphql';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import {
  createClient,
  everything,
  GenqlError,
  isHouse,
  type Account,
  type Point,
  type User,
} from './fixture/generated';
import { type GraphqlOperation } from './fixture/generated/runtime';

// Port of remorses/genql@v3.0.5 integration-tests/tests/execution.ts ("execute
// queries"). Upstream booted an apollo-server (v3, now deprecated) per test;
// here the same resolvers run through graphql-js `graphql()` behind an
// injected `fetch`/`fetcher`, which exercises the identical client code path
// (operation building, POST body, response parsing, batching, errors) without
// a network or any extra dependency. graphql-js resolves the abstract types
// (Account, Point, GenericError) from the `__typename` each resolver returns,
// as apollo did. Selections, assertions and test names are upstream's; tsd's
// `expectType` becomes `expectTypeOf`. The skipped upstream subscription suite
// (already skipped there) is not ported.
//
// One deliberate correction: upstream ran this file through mocha + sucrase,
// which strips types without checking them, so its `expectType` assertions
// were never verified — and several were wrong. The type assertions below pin
// what the 3.0.5 engine actually generates: response fields are `undefined`
// when unset (never `null` — honest `| null` response types arrived in genql
// v4), and `__typename` is a literal type, not `string`.

const SCHEMA_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'fixture',
  'schema.graphql',
);

const executableSchema: GraphQLSchema = buildSchema(
  readFileSync(SCHEMA_PATH, 'utf-8'),
);

const johnUser = {
  name: 'John',
};

// The Query resolvers from upstream's makeServer(), as graphql-js rootValue
// field functions (they receive the field args as first parameter).
const queryRootValue = {
  user: () => johnUser,
  throwsError: () => {
    throw new Error('x');
  },
  optionalArgs: () => ({ createdAt: 'now' }),
  unionThatImplementsInterface: ({ typename = '' }: { typename?: string }) => ({
    message: 'A message',
    ownProp1: 'Own prop 1',
    ownProp2: 'Own prop 2',
    __typename: typename || 'ClientErrorNameInvalid',
  }),
  someScalarValue: () => 'someScalarValue',
  repository: () => ({ createdAt: 'now' }),
  account: () => ({ __typename: 'User', ...johnUser }),
  coordinates: () => ({ __typename: 'Bank', x: '1', y: '2', address: '3' }),
};

const executeOperation = async (
  operation: GraphqlOperation,
): Promise<ExecutionResult> =>
  await graphql({
    schema: executableSchema,
    source: operation.query,
    variableValues: operation.variables,
    rootValue: queryRootValue,
  });

const executableFetch = vi.fn(
  async (_url: RequestInfo | URL, requestInit?: RequestInit) => {
    const body = JSON.parse(String(requestInit?.body)) as
      | GraphqlOperation
      | GraphqlOperation[];

    const payload = Array.isArray(body)
      ? await Promise.all(body.map(executeOperation))
      : await executeOperation(body);

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
) as unknown as typeof globalThis.fetch;

const URL_PLACEHOLDER = 'http://executable-schema.test/graphql';

describe('execute queries', () => {
  const client = createClient({
    url: URL_PLACEHOLDER,
    headers: () => ({ Auth: 'xxx' }),
    fetch: executableFetch,
  });

  it('first query', async () => {
    const res = await client.query({
      repository: {
        __args: {
          name: 'genql',
        },
        createdAt: true,
      },
      optionalArgs: {
        createdAt: true,
      },
    });
    expect(res.repository.createdAt).toBeTruthy();
    expect(res.optionalArgs.createdAt).toBeTruthy();
  });

  it('simple', async () => {
    const res = await client.query({
      user: {
        name: true,
      },
    });
    expect(res.user).toEqual(johnUser);
  });

  it('__typename is not optional', async () => {
    const res = await client.query({
      user: {
        name: true,
        __typename: true,
      },
    });
    expectTypeOf(res.user!.__typename).toEqualTypeOf<'User'>();
    expect(res.user?.__typename).toBe('User');
  });

  it('scalar value with argument', async () => {
    const withoutArgs = await client.query({
      someScalarValue: true,
    });
    expect(withoutArgs.someScalarValue?.toLocaleLowerCase).toBeTruthy();

    const withArgs = await client.query({
      someScalarValue: { __args: { x: 1 } },
    });
    expect(withArgs.someScalarValue?.toLocaleLowerCase).toBeTruthy();
  });

  it('falsy values are not fetched', async () => {
    const res = await client.query({
      coordinates: {
        x: false,
        y: true,
      },
    });
    expect(res.coordinates?.x).toBeUndefined();
    expect(res.coordinates?.y).toBeDefined();
  });

  it('required field and nested fields', async () => {
    const res = await client.query({
      repository: {
        __args: {
          name: 'genql',
          owner: 'remorses',
        },
        ...everything,
        forks: {
          __args: { filter: 'test' },
          edges: { node: { name: true, number: true } },
        },
      },
    });
    // @ts-expect-error top level fields are filtered based on the query
    void res?.account;
    // no optional chaining because repository is non null
    expectTypeOf(res.repository.createdAt).toEqualTypeOf<string>();
    expectTypeOf(res.repository.__typename).toEqualTypeOf<'Repository'>();
    expectTypeOf(
      res.repository?.forks?.edges?.map((edge) => edge?.node?.name),
    ).toEqualTypeOf<(string | undefined)[] | undefined>();
    expectTypeOf(
      res.repository?.forks?.edges?.map((edge) => edge?.node?.number),
    ).toEqualTypeOf<(number | undefined)[] | undefined>();
    expect(res.repository.createdAt).toBeTruthy();
  });

  it('union types only 1 on_ normal syntax', async () => {
    const { account } = await client.query({
      account: {
        __typename: 1,
        on_User: {
          name: 1,
        },
      },
    });
    // @ts-expect-error on_User should be removed from the response type
    void account?.on_User;
    expect(account?.__typename).toBeTruthy();
    expectTypeOf(account).toExtend<Account | undefined>();
    expectTypeOf(account?.__typename).toEqualTypeOf<
      'User' | 'Guest' | undefined
    >();
  });

  it('ability to query interfaces that a union implements', async () => {
    const { unionThatImplementsInterface } = await client.query({
      unionThatImplementsInterface: {
        __typename: 1,
        on_ClientErrorNameInvalid: {
          message: 1,
          ownProp2: 1,
        },
        on_ClientError: {
          message: 1,
        },
        on_ClientErrorWithoutInterface: {
          ownProp3: 1,
        },
      },
    });

    if (unionThatImplementsInterface?.__typename === 'ClientErrorNameInvalid') {
      expect(unionThatImplementsInterface?.ownProp2).toBeTruthy();
    }
    if (
      unionThatImplementsInterface?.__typename === 'ClientErrorWithoutInterface'
    ) {
      expect(unionThatImplementsInterface?.ownProp3).toBeTruthy();
    }
    expect(unionThatImplementsInterface?.__typename).toBe(
      'ClientErrorNameInvalid',
    );
  });

  it('interface types normal syntax', async () => {
    const res = await client.query({
      coordinates: {
        x: 1,
        __typename: 1,
        on_Bank: {
          address: 1,
        },
      },
    });
    const coordinates = res.coordinates;
    expectTypeOf(coordinates?.x).toEqualTypeOf<string | undefined>();
    if (coordinates && 'address' in coordinates) {
      expectTypeOf(coordinates?.address).toEqualTypeOf<string | undefined>();
      expect(coordinates?.address).toBeTruthy();
    }
    // common types are accessible without guards
    expect(coordinates?.x).toBeTruthy();
    expect(coordinates?.__typename).toBeTruthy();
  });

  it('multiple interfaces types normal syntax', async () => {
    const { coordinates } = await client.query({
      coordinates: {
        __typename: 1,
        on_Bank: {
          address: 1,
          x: 1,
        },
        on_House: {
          y: 1,
          x: 1,
          owner: {
            name: 1,
          },
        },
      },
    });

    expectTypeOf(coordinates?.x).toEqualTypeOf<string | undefined>();
    expectTypeOf(coordinates).toExtend<Point | undefined>();
    expectTypeOf(coordinates?.__typename).toEqualTypeOf<
      'Bank' | 'House' | undefined
    >();
    expect(coordinates?.x).toBeTruthy();
    expect(coordinates?.__typename).toBeTruthy();
    if (coordinates && 'address' in coordinates) {
      void coordinates?.address;
      void coordinates?.x;
    } else if (isHouse(coordinates)) {
      void coordinates?.owner;
      void coordinates?.x;
      void coordinates?.y;
    }
  });

  it('errors', async () => {
    const err = await client
      .query({
        throwsError: true,
      })
      .catch((error) => error);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(GenqlError);
    expect((err as GenqlError).errors.length).toBeTruthy();
  });

  it('errors are thrown with batching', async () => {
    const batchingClient = createClient({
      url: URL_PLACEHOLDER,
      fetch: executableFetch,
      batch: {
        batchInterval: 100,
      },
    });
    const [err1, err2] = await Promise.all([
      batchingClient
        .query({
          throwsError: true,
        })
        .catch((error) => error),
      batchingClient
        .query({
          throwsError: true,
        })
        .catch((error) => error),
    ]);
    expect(err1).toBeInstanceOf(GenqlError);
    expect(err2).toBeInstanceOf(GenqlError);
    expect((err1 as GenqlError).errors.length).toBeTruthy();
    expect((err2 as GenqlError).errors.length).toBeTruthy();
  });

  it('1 error and 1 result with batching', async () => {
    const batchingClient = createClient({
      url: URL_PLACEHOLDER,
      fetch: executableFetch,
      batch: {
        batchInterval: 100,
      },
    });
    const [err1, res] = await Promise.all([
      batchingClient
        .query({
          throwsError: true,
        })
        .catch((error) => error),
      batchingClient.query({
        user: {
          name: true,
        },
      }),
    ]);
    expect(err1).toBeInstanceOf(GenqlError);
    expect((err1 as GenqlError).errors.length).toBeTruthy();
    expect(res.user).toEqual(johnUser);
  });

  it('batches requests', async () => {
    let batchedQueryLength = -1;
    let requestsCount = 0;
    const batchingClient = createClient({
      batch: true,
      fetcher: async (body) => {
        requestsCount += 1;
        batchedQueryLength = Array.isArray(body) ? body.length : -1;
        const payload = Array.isArray(body)
          ? await Promise.all(body.map(executeOperation))
          : await executeOperation(body);

        // the real transport JSON-serializes; mirror it so GraphQLError
        // instances become the plain objects a fetcher returns
        return JSON.parse(JSON.stringify(payload));
      },
    });
    const res = await Promise.all([
      batchingClient.query({
        coordinates: {
          __typename: 1,
          x: 1,
        },
      }),
      batchingClient.query({
        coordinates: {
          __typename: 1,
          y: 1,
        },
      }),
    ]);
    expect(res.length).toBe(2);
    expect(batchedQueryLength).toBe(2);
    expect(requestsCount).toBe(1);
  });

  it('headers function gets called every time', async () => {
    let headersCalledNTimes = 0;
    const countingClient = createClient({
      url: URL_PLACEHOLDER,
      fetch: executableFetch,
      headers: () => {
        headersCalledNTimes++;
        return {};
      },
    });

    await countingClient.query({
      coordinates: {
        __typename: 1,
        x: 1,
      },
    });
    await countingClient.query({
      coordinates: {
        __typename: 1,
        y: 1,
      },
    });

    expect(headersCalledNTimes).toBe(2);
  });

  it('async headers function gets called every time', async () => {
    let headersCalledNTimes = 0;
    const countingClient = createClient({
      url: URL_PLACEHOLDER,
      fetch: executableFetch,
      headers: async () => {
        headersCalledNTimes++;
        return {};
      },
    });

    await countingClient.query({
      coordinates: {
        __typename: 1,
        x: 1,
      },
    });
    await countingClient.query({
      coordinates: {
        __typename: 1,
        y: 1,
      },
    });

    expect(headersCalledNTimes).toBe(2);
  });
});

// upstream asserted `DeepPartial<User>` assignability for the mock; keep the
// equivalent compile-time check without the tsdef dependency.
expectTypeOf(johnUser).toExtend<Partial<User>>();
