import { type LogicFunctionHttpResponse } from 'twenty-shared/types';

export type ResponseInit = {
  status?: number;
  headers?: Record<string, string>;
};

export class Response implements LogicFunctionHttpResponse {
  readonly __twentyHttpResponse = true as const;
  readonly body: unknown;
  readonly status?: number;
  readonly headers?: Record<string, string>;

  constructor(body: unknown, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status;
    this.headers = init?.headers;
  }
}
