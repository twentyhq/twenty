// Type stubs for the generated API client module.
// At build time, esbuild resolves twenty-sdk/generated to the actual
// generated client (or stubs) in the app's node_modules.
declare module 'twenty-sdk/generated' {
  export class CoreApiClient {
    query<R>(request: R): Promise<unknown>;
    mutation<R>(request: R): Promise<unknown>;
  }
  export class MetadataApiClient {}
}
