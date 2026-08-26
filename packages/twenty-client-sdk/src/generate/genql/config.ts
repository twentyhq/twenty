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
  // per-field TypeScript type overrides for response and request types, keyed
  // by GraphQL type name then field name. The override text replaces the
  // field's named type; nullability/list wrapping from the schema is kept.
  // Twenty uses this where the schema can only say `JSON` (RAW_JSON composite
  // sub-fields) but the runtime shape is known, e.g. Emails.additionalEmails.
  fieldTypeOverrides?: { [typeName: string]: { [fieldName: string]: string } };
  // sort the schema lexicographically before rendering
  sortProperties?: boolean;
}
