import { type Writable } from 'node:stream';

export type McpHttpResponseWriter = Writable & {
  status: (statusCode: number) => unknown;
  setHeader: (name: string, value: string) => unknown;
  json: (body: unknown) => unknown;
};
