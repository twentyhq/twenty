import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { createGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/create-granola-webhook-endpoint-or-throw.util';

const SCOPE_MISMATCH_BODY = {
  code: 'VALIDATION_ERROR',
  message: 'Invalid scopes',
  details: [
    {
      field: 'scopes',
      issue:
        'The workspace scope requires authenticating with a workspace API key',
    },
  ],
};

const REQUEST_BODY_SCHEMA = z.object({ scopes: z.array(z.string()) });

const buildEndpointResponse = (scopes: string[]) =>
  Response.json({
    id: 'whe_2mKr8fQxLp7Ta3',
    object: 'webhook_endpoint',
    url: 'https://example.com/hook',
    url_redacted: false,
    events: ['note.generated', 'note.access_granted', 'note.edited'],
    folder_ids: [],
    scopes,
    created_by: null,
    enabled: true,
    created_at: '2026-09-05T10:00:00Z',
    signing_secret: 'whsec_c2VjcmV0',
  });

const stubGranolaAcceptingScopes = (acceptedScopes: string) => {
  const mockedFetch = vi
    .fn<typeof fetch>()
    .mockImplementation(async (_url, request) => {
      const { scopes } = REQUEST_BODY_SCHEMA.parse(
        JSON.parse(String(request?.body)),
      );

      return scopes.join(',') === acceptedScopes
        ? buildEndpointResponse(scopes)
        : Response.json(SCOPE_MISMATCH_BODY, { status: 400 });
    });
  vi.stubGlobal('fetch', mockedFetch);

  return mockedFetch;
};

const requestedScopes = (mockedFetch: ReturnType<typeof vi.fn<typeof fetch>>) =>
  mockedFetch.mock.calls.map(
    ([, request]) =>
      REQUEST_BODY_SCHEMA.parse(JSON.parse(String(request?.body))).scopes,
  );

afterEach(() => vi.unstubAllGlobals());

describe('createGranolaWebhookEndpointOrThrow', () => {
  it('registers a workspace key with workspace scope on the first attempt', async () => {
    const mockedFetch = stubGranolaAcceptingScopes('workspace');

    const endpoint = await createGranolaWebhookEndpointOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      url: 'https://example.com/hook',
      preferredScopes: undefined,
      folderIds: [],
    });

    expect(endpoint.scopes).toEqual(['workspace']);
    expect(requestedScopes(mockedFetch)).toEqual([['workspace']]);
  });

  it('falls back to personal scopes when Granola rejects workspace scope for a personal key', async () => {
    const mockedFetch = stubGranolaAcceptingScopes('personal,public');

    const endpoint = await createGranolaWebhookEndpointOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      url: 'https://example.com/hook',
      preferredScopes: undefined,
      folderIds: ['fol_2mKr8fQxLp7Ta3'],
    });

    expect(endpoint.scopes).toEqual(['personal', 'public']);
    expect(requestedScopes(mockedFetch)).toEqual([
      ['workspace'],
      ['personal', 'public'],
    ]);
    expect(String(mockedFetch.mock.calls[1][1]?.body)).toContain(
      'fol_2mKr8fQxLp7Ta3',
    );
  });

  it('tries the previously registered scopes first', async () => {
    const mockedFetch = stubGranolaAcceptingScopes('personal,public');

    await createGranolaWebhookEndpointOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      url: 'https://example.com/hook',
      preferredScopes: ['personal', 'public'],
      folderIds: [],
    });

    expect(requestedScopes(mockedFetch)).toEqual([['personal', 'public']]);
  });

  it('rethrows errors that are not a scope mismatch', async () => {
    const mockedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 403 }));
    vi.stubGlobal('fetch', mockedFetch);

    const promise = createGranolaWebhookEndpointOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      url: 'https://example.com/hook',
      preferredScopes: undefined,
      folderIds: [],
    });

    await expect(promise).rejects.toBeInstanceOf(GranolaApiError);
    await expect(promise).rejects.toMatchObject({ status: 403 });
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});
