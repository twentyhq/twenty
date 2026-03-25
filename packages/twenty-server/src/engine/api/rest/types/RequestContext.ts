import { type Request } from 'express';

export type RequestContext = {
  headers: Request['headers'];
  baseUrl: string;
  path: Request['path'];
  body?: Request['body'];
  query?: Request['query'];
};
