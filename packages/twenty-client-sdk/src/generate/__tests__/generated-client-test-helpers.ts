import { readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { transform } from 'esbuild';

import { buildClientWrapperSource } from '../client-wrapper';

const twentyClientTemplateSource = readFileSync(
  join(__dirname, '..', 'twenty-client-template.ts'),
  'utf-8',
);

export type GeneratedUploadedFile = {
  id: string;
  path: string;
  size: number;
  createdAt: string;
  url: string;
};

export type GeneratedClientClass = new (options?: {
  url?: string;
  fetch?: typeof globalThis.fetch;
}) => {
  query: (request: Record<string, unknown>) => Promise<unknown>;
  uploadFile: (
    fileBuffer: Buffer,
    filename: string,
    contentType: string,
    fieldMetadataUniversalIdentifier: string,
  ) => Promise<GeneratedUploadedFile>;
};

const stubGeneratedIndexSource = `
export type QueryGenqlSelection = Record<string, unknown>
export type MutationGenqlSelection = Record<string, unknown>
export type GraphqlOperation = Record<string, unknown>

export type ClientOptions = {
  url?: string
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>)
  fetcher?: (operation: GraphqlOperation | GraphqlOperation[]) => Promise<unknown>
  fetch?: typeof globalThis.fetch
  batch?: unknown
}

export type Client = {
  query: (request: QueryGenqlSelection & { __name?: string }) => Promise<unknown>
  mutation: (
    request: MutationGenqlSelection & { __name?: string },
  ) => Promise<unknown>
}

export class GenqlError extends Error {
  constructor(
    public readonly errors: unknown,
    public readonly data: unknown,
  ) {
    super('GenqlError')
  }
}

export const createClient = (options: ClientOptions): Client => {
  return {
    query: (request) => {
      return options.fetcher?.({
        query: 'query',
        variables: request,
      })
    },
    mutation: (request) => {
      return options.fetcher?.({
        query: 'mutation',
        variables: request,
      })
    },
  }
}
`;

export const loadGeneratedClientClass = async (): Promise<{
  GeneratedClientClass: GeneratedClientClass;
  cleanup: () => Promise<void>;
}> => {
  const temporaryDir = await mkdtemp(
    join(tmpdir(), 'twenty-generated-client-'),
  );

  const wrapperSource = buildClientWrapperSource(twentyClientTemplateSource, {
    apiClientName: 'MetadataApiClient',
    defaultUrl: '`${process.env.TWENTY_API_URL}/metadata`',
    includeUploadFile: true,
  });

  const transpiledModule = await transform(
    stubGeneratedIndexSource + wrapperSource,
    {
      loader: 'ts',
      format: 'esm',
      target: 'es2022',
    },
  );

  const outputPath = join(temporaryDir, 'index.mjs');

  await writeFile(outputPath, transpiledModule.code);

  const generatedModule = await import(
    `${pathToFileURL(outputPath).href}?t=${Date.now()}`
  );

  return {
    GeneratedClientClass: generatedModule.MetadataApiClient,
    cleanup: () => rm(temporaryDir, { recursive: true, force: true }),
  };
};

export const createJsonResponse = ({
  body,
  status = 200,
  statusText = 'OK',
}: {
  body: unknown;
  status?: number;
  statusText?: string;
}) =>
  new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  });

export const getAuthorizationHeaderValue = (
  requestInit: RequestInit | undefined,
) => {
  return new Headers(requestInit?.headers).get('Authorization');
};
