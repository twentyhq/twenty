// CoreApiClient types are generated at dev-time by `twenty app:dev`.
// This declaration allows tsc to pass before the generated types exist.
// Once `app:dev` runs, the generated module provides full type safety.
declare module 'twenty-sdk/clients' {
  export class CoreApiClient {
    query(selection: Record<string, unknown>): Promise<Record<string, unknown>>;
    mutation(
      selection: Record<string, unknown>,
    ): Promise<Record<string, unknown>>;
  }
  export const CoreSchema: unknown;
  export class MetadataApiClient {}
  export const MetadataSchema: unknown;
}
