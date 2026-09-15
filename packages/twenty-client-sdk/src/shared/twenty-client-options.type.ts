import { type TwentyClientRunAs } from './twenty-client-run-as.type';

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
