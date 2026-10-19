import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import ts from 'typescript';

import { generateCoreClientFromSchema } from '../generate-core-client';

// Exercises a client produced by the vendored genql codegen end to end: the
// real runtime builds the GraphQL operation from a selection, posts it through
// an injected fetch, and parses the response. This complements
// client-wrapper-auth.test.ts, which stubs createClient and so never runs the
// vendored runtime's query-building path.
const SCHEMA = `
scalar JSON

type Query {
  hello: String
  person(id: ID!): Person
}

type Mutation {
  createPerson(name: String!): Person
  echoJson(value: JSON): JSON
}

type Person {
  id: ID!
  name: String
}

schema {
  query: Query
  mutation: Mutation
}
`;

type GeneratedClient = {
  query: (request: Record<string, unknown>) => Promise<any>;
  mutation: (request: Record<string, unknown>) => Promise<any>;
};

type CreateClient = (options: {
  url?: string;
  fetch?: typeof globalThis.fetch;
  batch?: boolean;
}) => GeneratedClient;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('Generated client queries the API (vendored genql runtime)', () => {
  let temporaryDir: string;
  let createClient: CreateClient;

  beforeAll(async () => {
    temporaryDir = await mkdtemp(join(tmpdir(), 'twenty-genql-query-'));
    const outputPath = join(temporaryDir, 'client');

    await generateCoreClientFromSchema({ schema: SCHEMA, outputPath });

    const generatedModule = await import(
      `${pathToFileURL(join(outputPath, 'index.mjs')).href}?t=${Date.now()}`
    );
    createClient = generatedModule.createClient as CreateClient;
  }, 60000);

  afterAll(async () => {
    if (temporaryDir) {
      await rm(temporaryDir, { recursive: true, force: true });
    }
  });

  it('builds a GraphQL query from a selection and returns parsed data', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ data: { person: { id: '1', name: 'Ada' } } }),
    );

    const client = createClient({
      url: 'https://example.test/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    const result = await client.query({
      person: { __args: { id: '1' }, id: true, name: true },
    });

    expect(result).toEqual({ person: { id: '1', name: 'Ada' } });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, requestInit] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe('https://example.test/graphql');
    expect(requestInit?.method).toBe('POST');

    const body = JSON.parse(String(requestInit?.body));
    expect(body.query).toMatch(/person/);
    expect(body.query).toMatch(/\bid\b/);
    expect(body.query).toMatch(/\bname\b/);
    // the id argument made it into the operation (inline or as a variable)
    expect(JSON.stringify(body)).toContain('1');
  });

  it('builds a mutation operation', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ data: { createPerson: { id: '2', name: 'Lin' } } }),
    );

    const client = createClient({
      url: 'https://example.test/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    const result = await client.mutation({
      createPerson: { __args: { name: 'Lin' }, id: true, name: true },
    });

    expect(result).toEqual({ createPerson: { id: '2', name: 'Lin' } });
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.query).toMatch(/mutation/);
    expect(body.query).toMatch(/createPerson/);
  });

  it('accepts JSON arrays and primitives without casts and preserves their payloads', async () => {
    const consumerPath = join(temporaryDir, 'json-consumer.ts');
    await writeFile(
      consumerPath,
      `import type { Scalars } from './client/schema';
      const values: Scalars['JSON'][] = [
        [{ participant: { name: 'Ada' }, words: [{ text: 'Hello' }] }],
        { nested: [1, true, null] }, 'text', 1, true, null,
      ];
      void values;`,
    );
    const program = ts.createProgram([consumerPath], {
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      types: [],
      target: ts.ScriptTarget.ES2022,
    });
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        ),
    ).toEqual([]);

    const transcript = [
      { participant: { name: 'Ada' }, words: [{ text: 'Hello' }] },
    ];
    const fetchMock = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({ data: { echoJson: transcript } }),
    );
    const client = createClient({
      url: 'https://example.test/graphql',
      fetch: fetchMock,
    });
    expect(
      await client.mutation({ echoJson: { __args: { value: transcript } } }),
    ).toEqual({ echoJson: transcript });
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(Object.values(body.variables)).toContainEqual(transcript);
  });

  it('throws when the API responds with GraphQL errors', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ errors: [{ message: 'Not authorized' }], data: null }),
    );

    const client = createClient({
      url: 'https://example.test/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await expect(
      client.query({ person: { __args: { id: '1' }, id: true } }),
    ).rejects.toThrow();
  });

  it('rejects (does not hang) when a batched request fails', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('network down');
    });

    const client = createClient({
      url: 'https://example.test/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
      // batch is the path where the runtime previously swallowed fetch errors,
      // leaving the caller's promise unsettled.
      batch: true,
    });

    await expect(
      client.query({ person: { __args: { id: '1' }, id: true } }),
    ).rejects.toThrow(/network down/);
  });
});
