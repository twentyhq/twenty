import { type Request } from 'express';

import { resolveWorkspaceIdFromRequest } from 'src/engine/core-modules/application-registration-webhook/utils/resolve-workspace-id-from-request.util';

const buildRequest = (overrides: Partial<Request>): Request =>
  ({ query: {}, headers: {}, body: null, ...overrides }) as unknown as Request;

describe('resolveWorkspaceIdFromRequest', () => {
  it('resolves a nested value from the body', () => {
    const request = buildRequest({
      body: { metadata: { twentyWorkspaceId: 'ws-1' } },
    });

    expect(
      resolveWorkspaceIdFromRequest({
        resolver: { source: 'body', path: 'metadata.twentyWorkspaceId' },
        request,
      }),
    ).toBe('ws-1');
  });

  it('resolves from a query parameter', () => {
    const request = buildRequest({ query: { twentyWorkspaceId: 'ws-2' } });

    expect(
      resolveWorkspaceIdFromRequest({
        resolver: { source: 'query', path: 'twentyWorkspaceId' },
        request,
      }),
    ).toBe('ws-2');
  });

  it('resolves from a header (taking the first value of an array)', () => {
    const request = buildRequest({
      headers: { 'x-workspace-id': ['ws-3', 'ws-other'] } as Request['headers'],
    });

    expect(
      resolveWorkspaceIdFromRequest({
        resolver: { source: 'header', path: 'x-workspace-id' },
        request,
      }),
    ).toBe('ws-3');
  });

  it('rejects prototype-pollution path segments', () => {
    const request = buildRequest({ body: { metadata: { id: 'ws-4' } } });

    expect(
      resolveWorkspaceIdFromRequest({
        resolver: { source: 'body', path: '__proto__.id' },
        request,
      }),
    ).toBeUndefined();
  });

  it('resolves kebab-case keys (e.g. header names)', () => {
    const request = buildRequest({ body: { 'a-b': 'ws-5' } });

    expect(
      resolveWorkspaceIdFromRequest({
        resolver: { source: 'body', path: 'a-b' },
        request,
      }),
    ).toBe('ws-5');
  });

  it('rejects path segments with unsafe characters', () => {
    const request = buildRequest({ body: { 'a b': 'ws-6' } });

    expect(
      resolveWorkspaceIdFromRequest({
        resolver: { source: 'body', path: 'a b' },
        request,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the value is absent', () => {
    const request = buildRequest({ body: { metadata: {} } });

    expect(
      resolveWorkspaceIdFromRequest({
        resolver: { source: 'body', path: 'metadata.twentyWorkspaceId' },
        request,
      }),
    ).toBeUndefined();
  });
});
