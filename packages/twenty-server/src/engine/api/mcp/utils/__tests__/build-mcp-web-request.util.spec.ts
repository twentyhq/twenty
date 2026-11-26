import { type IncomingHttpHeaders } from 'node:http';

import { buildMcpWebRequest } from 'src/engine/api/mcp/utils/build-mcp-web-request.util';

const buildRequest = (headers: IncomingHttpHeaders) =>
  buildMcpWebRequest({
    url: 'https://acme.twenty.com/mcp?mode=meta',
    method: 'POST',
    headers,
    signal: new AbortController().signal,
  });

describe('buildMcpWebRequest', () => {
  it('should keep the url, method and protocol headers', () => {
    const webRequest = buildRequest({
      'content-type': 'application/json',
      'mcp-protocol-version': '2026-07-28',
      'mcp-method': 'tools/list',
    });

    expect(webRequest.url).toBe('https://acme.twenty.com/mcp?mode=meta');
    expect(webRequest.method).toBe('POST');
    expect(webRequest.headers.get('mcp-protocol-version')).toBe('2026-07-28');
    expect(webRequest.headers.get('mcp-method')).toBe('tools/list');
  });

  it('should accept both response types whatever the client sent', () => {
    const webRequest = buildRequest({ accept: 'application/json' });

    expect(webRequest.headers.get('accept')).toBe(
      'application/json, text/event-stream',
    );
  });

  it('should drop headers that describe the already parsed body', () => {
    const webRequest = buildRequest({
      'content-length': '42',
      'transfer-encoding': 'chunked',
    });

    expect(webRequest.headers.has('content-length')).toBe(false);
    expect(webRequest.headers.has('transfer-encoding')).toBe(false);
  });
});
