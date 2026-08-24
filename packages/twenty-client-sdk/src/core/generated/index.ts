// Stub — this file is replaced by the generated client when the app
// is installed or sync on a Twenty instance.
// Do not edit manually.

// Types only the options the stub can faithfully mirror; other generated
// client options pass through untyped so pre- and post-generation
// typechecking cannot disagree on them.
type CoreApiClientStubOptions = {
  url?: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  runAs?: 'user' | 'application';
} & Record<string, unknown>;

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
