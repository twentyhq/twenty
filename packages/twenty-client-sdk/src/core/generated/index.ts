// Stub — this file is replaced by the generated client when the app
// is installed or sync on a Twenty instance.
// Do not edit manually.

// Mirrors TwentyGeneratedClientOptions from generate/twenty-client-template.ts
// so this pre-generation stub and the post-generation client agree on typecheck.
type CoreApiClientStubOptions = {
  url?: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  fetcher?: (operation: unknown) => Promise<unknown>;
  fetch?: typeof globalThis.fetch;
  batch?: unknown;
  runAs?: 'user' | 'application';
};

export class CoreApiClient {
  query: any;
  mutation: any;
  upload: any;

  constructor(_options?: CoreApiClientStubOptions) {
    throw new Error(
      'CoreApiClient was not generated. ' +
        'Install this app on a Twenty instance or run `yarn twenty dev`.',
    );
  }
}
