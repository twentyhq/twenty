// Stub — this file is replaced by the generated client when the app
// is installed or sync on a Twenty instance.
// Do not edit manually.

// Mirrors the constructor options of the generated client so app code
// typechecks the same before and after generation.
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
