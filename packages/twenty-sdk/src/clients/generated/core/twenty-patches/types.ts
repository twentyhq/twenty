// Minimal type definitions for the core client stub.
// These mirror the shapes used by the genql runtime but are
// self-contained — no imports from @genql/runtime.

export type LinkedArgMap = {
  [arg: string]: [LinkedType, string] | undefined;
};

export type LinkedField = {
  type: LinkedType;
  args?: LinkedArgMap;
};

export type LinkedFieldMap = {
  [field: string]: LinkedField | undefined;
};

export type LinkedType = {
  name: string;
  fields?: LinkedFieldMap;
  scalar?: string[];
};

export type GraphqlOperation = {
  query: string;
  variables?: { [name: string]: unknown };
  operationName?: string;
};

export type ClientOptions = Omit<RequestInit, 'body' | 'headers'> & {
  url?: string;
  batch?: unknown;
  fetcher?: (
    operation: GraphqlOperation | GraphqlOperation[],
  ) => Promise<unknown>;
  fetch?: typeof globalThis.fetch;
  headers?: HeadersInit | (() => HeadersInit) | (() => Promise<HeadersInit>);
};
