import { type IncomingHttpHeaders } from 'node:http';

import { isDefined } from 'twenty-shared/utils';

import { MCP_WEB_REQUEST_ACCEPT } from 'src/engine/api/mcp/constants/mcp-web-request-accept.constant';

// The parsed body travels separately, so headers describing the raw body are dropped
const HEADERS_NOT_FORWARDED = new Set([
  'connection',
  'content-length',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
]);

export const buildMcpWebRequest = ({
  url,
  method,
  headers: incomingHeaders,
  signal,
}: {
  url: string;
  method: string;
  headers: IncomingHttpHeaders;
  signal: AbortSignal;
}): Request => {
  const headers = new Headers();

  for (const [name, value] of Object.entries(incomingHeaders)) {
    if (!isDefined(value) || HEADERS_NOT_FORWARDED.has(name)) {
      continue;
    }

    headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }

  headers.set('accept', MCP_WEB_REQUEST_ACCEPT);

  return new Request(url, { method, headers, signal });
};
