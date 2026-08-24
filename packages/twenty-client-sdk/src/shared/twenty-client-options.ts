import { type TwentyClientRunAs } from './twenty-client-run-as';

// Mirrors the genql ClientOptions (Omit<RequestInit, 'body' | 'headers'> plus
// these fields) the generated client accepts; hand-mirrored because the genql
// types do not exist until `twenty dev` runs.
export type TwentyClientOptions = Omit<RequestInit, 'body' | 'headers'> & {
  url?: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  fetcher?: (
    operation: Record<string, unknown> | Record<string, unknown>[],
  ) => Promise<unknown>;
  fetch?: typeof globalThis.fetch;
  batch?: unknown;
  runAs?: TwentyClientRunAs;
};
