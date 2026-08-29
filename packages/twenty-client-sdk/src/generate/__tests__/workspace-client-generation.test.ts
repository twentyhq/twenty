import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { generateCoreClientFromSchema } from '../generate-core-client';
import { WORKSPACE_SCHEMA_FIXTURE } from './fixtures/workspace-schema.fixture';

type GeneratedClient = {
  query: (request: Record<string, unknown>) => Promise<any>;
  mutation: (request: Record<string, unknown>) => Promise<any>;
};

type CreateClient = (options: {
  url?: string;
  fetch?: typeof globalThis.fetch;
}) => GeneratedClient;

const CONSUMER_COMPILER_OPTIONS: ts.CompilerOptions = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const fileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path);

    return true;
  } catch {
    return false;
  }
};

describe('Core client generated from a workspace schema', () => {
  let temporaryDir: string;
  let outputPath: string;
  let generatedTypes: string;
  let createClient: CreateClient;
  let consumerCount = 0;

  const typecheckAgainstGeneratedTypes = async (
    source: string,
  ): Promise<string[]> => {
    const consumerPath = join(outputPath, `consumer-${consumerCount++}.ts`);

    await writeFile(consumerPath, source);

    const program = ts.createProgram([consumerPath], CONSUMER_COMPILER_OPTIONS);

    return ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
      );
  };

  beforeAll(async () => {
    temporaryDir = await mkdtemp(join(tmpdir(), 'twenty-workspace-client-'));
    outputPath = join(temporaryDir, 'client');

    await generateCoreClientFromSchema({
      schema: WORKSPACE_SCHEMA_FIXTURE,
      outputPath,
    });

    generatedTypes = await readFile(join(outputPath, 'schema.ts'), 'utf-8');

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

  it('emits the client sources and the bundles consumers import', async () => {
    const emittedFiles = [
      'schema.ts',
      'types.ts',
      'index.ts',
      'schema.graphql',
      'index.mjs',
      'index.cjs',
      'package.json',
      join('runtime', 'index.ts'),
    ];

    for (const emittedFile of emittedFiles) {
      expect(
        await fileExists(join(outputPath, emittedFile)),
        `${emittedFile} was not emitted`,
      ).toBe(true);
    }
  });

  describe('composite RAW_JSON sub-fields', () => {
    it('types them with their real shape in response types', () => {
      expect(generatedTypes).toContain('additionalEmails?: string[]');
      expect(generatedTypes).toContain(
        'additionalPhones?: Array<{ number: string; callingCode: string; countryCode: string }>',
      );
      expect(generatedTypes).toContain(
        'secondaryLinks?: Array<{ label: string; url: string }>',
      );
      expect(generatedTypes).toContain('context?: { provider?: string }');
    });

    it('types them as nullable in create and update inputs', () => {
      expect(generatedTypes).toContain(
        "export interface EmailsCreateInput {primaryEmail?: (Scalars['String'] | null),additionalEmails?: (string[] | null)}",
      );
      expect(generatedTypes).toContain(
        "export interface EmailsUpdateInput {primaryEmail?: (Scalars['String'] | null),additionalEmails?: (string[] | null)}",
      );
      expect(generatedTypes).toContain(
        'additionalPhones?: (Array<{ number: string; callingCode: string; countryCode: string }> | null)',
      );
      expect(generatedTypes).toContain(
        'secondaryLinks?: (Array<{ label: string; url: string }> | null)',
      );
      expect(generatedTypes).toContain(
        'context?: ({ provider?: string } | null)',
      );
    });

    it('leaves no composite sub-field on the JSON scalar mapping', () => {
      expect(generatedTypes).not.toMatch(
        /(additionalEmails|additionalPhones|secondaryLinks)\?: \(?Scalars\['JSON'\]/,
      );
      expect(generatedTypes).not.toMatch(
        /export interface Actor(Create|Update)?Input? \{[^}]*context\?: \(?Scalars\['JSON'\]/,
      );
    });
  });

  describe('parts of the schema the overrides must not touch', () => {
    it('keeps object-level JSON fields on the scalar mapping', () => {
      expect(generatedTypes).toContain("customFields?: Scalars['JSON']");
      expect(generatedTypes).toContain(
        "customFields?: (Scalars['JSON'] | null)",
      );
    });

    it('keeps filter inputs on their filter types', () => {
      expect(generatedTypes).toContain(
        'export interface EmailsFilterInput {primaryEmail?: (StringFilter | null),additionalEmails?: (RawJsonFilter | null)}',
      );
      expect(generatedTypes).toContain('context?: (RawJsonFilter | null)');
    });

    it('keeps order-by inputs on the direction enum', () => {
      expect(generatedTypes).toContain(
        'export interface EmailsOrderByInput {primaryEmail?: (OrderByDirection | null),additionalEmails?: (OrderByDirection | null)}',
      );
    });

    it('keeps selection types on the boolean selectors', () => {
      expect(generatedTypes).toMatch(
        /export interface EmailsGenqlSelection\{\n\s*primaryEmail\?: boolean \| number\n\s*additionalEmails\?: boolean \| number/,
      );
    });
  });

  describe('type-level contract for consumers', () => {
    it('accepts the real composite shapes', async () => {
      const diagnostics = await typecheckAgainstGeneratedTypes(`
        import type { Actor, Emails, Links, PersonCreateInput, Phones } from './schema';

        const emails: Emails = {
          primaryEmail: 'ada@example.com',
          additionalEmails: ['ada.work@example.com'],
          __typename: 'Emails',
        };

        const additionalEmails: string[] | undefined = emails.additionalEmails;

        const phones: Phones = {
          additionalPhones: [
            { number: '123456789', callingCode: '+33', countryCode: 'FR' },
          ],
          __typename: 'Phones',
        };

        const links: Links = {
          secondaryLinks: [{ label: 'Blog', url: 'https://example.com' }],
          __typename: 'Links',
        };

        const createdBy: Actor = {
          source: 'MANUAL',
          name: 'Ada',
          context: { provider: 'google' },
          __typename: 'Actor',
        };

        const createInput: PersonCreateInput = {
          emails: { additionalEmails: ['ada.work@example.com'] },
          phones: { additionalPhones: [] },
          linkedinLink: { secondaryLinks: null },
          createdBy: { source: 'MANUAL', context: { provider: 'google' } },
          customFields: { anything: true },
        };

        export { additionalEmails, createInput, createdBy, links, phones };
      `);

      expect(diagnostics).toEqual([]);
    });

    it('rejects a value of the wrong primitive type', async () => {
      const diagnostics = await typecheckAgainstGeneratedTypes(`
        import type { EmailsCreateInput } from './schema';

        export const emails: EmailsCreateInput = { additionalEmails: [42] };
      `);

      expect(diagnostics).toEqual([
        "Type 'number' is not assignable to type 'string'.",
      ]);
    });

    it('rejects a composite object missing a required key', async () => {
      const diagnostics = await typecheckAgainstGeneratedTypes(`
        import type { LinksCreateInput } from './schema';

        export const links: LinksCreateInput = {
          secondaryLinks: [{ label: 'Blog' }],
        };
      `);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]).toContain('url');
    });

    it('no longer types a composite sub-field as an untyped record', async () => {
      const diagnostics = await typecheckAgainstGeneratedTypes(`
        import type { Emails } from './schema';

        export const readAsRecord = (emails: Emails): Record<string, unknown> =>
          emails.additionalEmails ?? {};
      `);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]).toContain('string[]');
    });
  });

  describe('runtime round trip', () => {
    it('sends composite selections and parses composite payloads back', async () => {
      const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
        jsonResponse({
          data: {
            people: {
              edges: [
                {
                  node: {
                    id: '20202020-0687-4c41-b707-ed1bfca972a7',
                    emails: {
                      primaryEmail: 'ada@example.com',
                      additionalEmails: ['ada.work@example.com'],
                    },
                    createdBy: { context: { provider: 'google' } },
                  },
                },
              ],
            },
          },
        }),
      );

      const client = createClient({
        url: 'https://example.test/graphql',
        fetch: fetchMock as unknown as typeof globalThis.fetch,
      });

      const result = await client.query({
        people: {
          __args: {
            filter: { emails: { primaryEmail: { ilike: '%ada%' } } },
            first: 10,
          },
          edges: {
            node: {
              id: true,
              emails: { primaryEmail: true, additionalEmails: true },
              createdBy: { context: true },
            },
          },
        },
      });

      expect(result.people.edges[0].node.emails.additionalEmails).toEqual([
        'ada.work@example.com',
      ]);

      const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

      expect(body.query).toBe(
        'query ($v1:PersonFilterInput,$v2:Int){people(filter:$v1,first:$v2){edges{node{id,emails{primaryEmail,additionalEmails},createdBy{context}}}}}',
      );
      expect(body.variables).toEqual({
        v1: { emails: { primaryEmail: { ilike: '%ada%' } } },
        v2: 10,
      });
    });

    it('sends a composite array argument as a JSON array, not a string', async () => {
      const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
        jsonResponse({
          data: {
            createPerson: {
              id: '20202020-0687-4c41-b707-ed1bfca972a7',
              emails: { additionalEmails: ['ada.work@example.com'] },
            },
          },
        }),
      );

      const client = createClient({
        url: 'https://example.test/graphql',
        fetch: fetchMock as unknown as typeof globalThis.fetch,
      });

      await client.mutation({
        createPerson: {
          __args: {
            data: {
              emails: {
                primaryEmail: 'ada@example.com',
                additionalEmails: ['ada.work@example.com'],
              },
            },
          },
          id: true,
          emails: { additionalEmails: true },
        },
      });

      const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

      expect(body.query).toBe(
        'mutation ($v1:PersonCreateInput!){createPerson(data:$v1){id,emails{additionalEmails}}}',
      );
      expect(body.variables.v1.emails.additionalEmails).toEqual([
        'ada.work@example.com',
      ]);
    });
  });
});
