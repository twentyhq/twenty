// Path the generated client imports its runtime from.
export const RUNTIME_LIB_NAME = './runtime';

// Configuration for the narrowed codegen. Twenty only ever generates from a
// schema string. Upstream genql additionally supported live-endpoint
// introspection (`endpoint`/`useGet`/`headers`), a custom `fetch` import
// (`fetchImport`) and listr `verbose` output — all of which were dropped when
// this codegen was vendored, so they are omitted here. The generated client's
// connection (url/fetch) is provided by the wrapper in twenty-client-template.ts.
export interface Config {
  // the schema string (SDL)
  schema?: string;
  // the output dir
  output?: string;
  // maps GraphQL scalars to TypeScript types
  scalarTypes?: { [k: string]: string };
  // sort the schema lexicographically before rendering
  sortProperties?: boolean;
}
