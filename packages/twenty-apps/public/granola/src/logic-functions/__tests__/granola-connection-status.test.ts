import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { granolaConnectionStatusHandler } from 'src/logic-functions/granola-connection-status';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';

vi.mock(
  'src/logic-functions/utils/find-granola-registration-for-current-key.util',
  () => ({ findGranolaRegistrationForCurrentKey: vi.fn() }),
);

const jsonResponse = ({
  body,
  status = 200,
}: {
  body: unknown;
  status?: number;
}) => new Response(JSON.stringify(body), { status });

const ENDPOINT = {
  id: 'whe_workspace',
  object: 'webhook_endpoint',
  url: 'https://crm.example.com/webhooks/server/granola',
  url_redacted: false,
  scopes: ['workspace'],
  events: ['note.generated'],
  folder_ids: [],
  enabled: true,
  created_by: null,
  created_at: '2026-11-20T08:17:02.000Z',
};

const stubGranola = ({
  foldersStatus,
  endpointsStatus,
}: {
  foldersStatus: number;
  endpointsStatus: number;
}) => {
  const mockedFetch = vi.fn<typeof fetch>(async (input) =>
    String(input).includes('/webhook-endpoints')
      ? jsonResponse({
          body:
            endpointsStatus === 200
              ? { webhook_endpoints: [ENDPOINT], hasMore: false, cursor: null }
              : { code: 'FORBIDDEN' },
          status: endpointsStatus,
        })
      : jsonResponse({
          body:
            foldersStatus === 200
              ? { folders: [], hasMore: false, cursor: null }
              : { code: 'UNAUTHORIZED' },
          status: foldersStatus,
        }),
  );

  vi.stubGlobal('fetch', mockedFetch);

  return mockedFetch;
};

beforeEach(() => {
  vi.stubEnv(GRANOLA_API_KEY_ENV_VAR_NAME, 'grn_workspace_test');
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('granolaConnectionStatusHandler', () => {
  it('asks Granola for the key check and the webhook list at the same time', async () => {
    const markEndpointsRequested: (() => void)[] = [];
    const endpointsRequested = new Promise<void>((resolve) => {
      markEndpointsRequested.push(resolve);
    });
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (String(input).includes('/webhook-endpoints')) {
          markEndpointsRequested.forEach((markRequested) => markRequested());

          return jsonResponse({
            body: {
              webhook_endpoints: [ENDPOINT],
              hasMore: false,
              cursor: null,
            },
          });
        }

        await endpointsRequested;

        return jsonResponse({
          body: { folders: [], hasMore: false, cursor: null },
        });
      }),
    );
    vi.mocked(findGranolaRegistrationForCurrentKey).mockResolvedValue({
      registrationId: 'registration-id',
      webhookEndpointId: ENDPOINT.id,
      signingSecret: 'whsec_test',
      apiKeyFingerprint: 'fingerprint',
      scopes: ['workspace'],
      folderIds: [],
      isInitialBackfillEnqueued: true,
    });

    await expect(granolaConnectionStatusHandler()).resolves.toEqual({
      isConnected: true,
      isApiKeySet: true,
      registration: { scopes: ['workspace'], isActive: true },
    });
  });

  it('reports a rejected key even when the webhook list fails too', async () => {
    stubGranola({ foldersStatus: 401, endpointsStatus: 401 });

    await expect(granolaConnectionStatusHandler()).resolves.toMatchObject({
      isConnected: false,
      isApiKeySet: true,
    });
    expect(findGranolaRegistrationForCurrentKey).not.toHaveBeenCalled();
  });

  it('asks for registration when only the webhook list is refused', async () => {
    stubGranola({ foldersStatus: 200, endpointsStatus: 403 });

    await expect(granolaConnectionStatusHandler()).resolves.toMatchObject({
      isConnected: true,
      isApiKeySet: true,
      needsRegistration: true,
    });
  });
});
