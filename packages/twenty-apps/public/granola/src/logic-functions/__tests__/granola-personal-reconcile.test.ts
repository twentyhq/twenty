import { getConnection, kv, listConnections } from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OWN_CONNECTION } from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { granolaPersonalReconcileHandler } from 'src/logic-functions/granola-personal-reconcile';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { getGranolaPersonalRegistrationId } from 'src/logic-functions/utils/get-granola-personal-registration-id.util';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  getConnection: vi.fn(),
  listConnections: vi.fn(),
  kv: { get: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('granolaPersonalReconcileHandler', () => {
  it('skips connection hooks until the member saves a folder selection', async () => {
    vi.mocked(kv.get).mockResolvedValue(null);

    await expect(
      granolaPersonalReconcileHandler({
        connectedAccountId: OWN_CONNECTION.id,
      }),
    ).resolves.toEqual({ success: true, skipped: true });
    expect(getConnection).not.toHaveBeenCalled();
  });

  it('skips scheduled reconciliation after the connection key changes', async () => {
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    vi.mocked(kv.get).mockResolvedValue([]);
    const fetchProvider = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchProvider);

    await expect(
      granolaPersonalReconcileHandler({
        connectedAccountId: OWN_CONNECTION.id,
        userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
        scheduledApiKeyFingerprint: 'previous-key-fingerprint',
      }),
    ).resolves.toEqual({ success: true, skipped: true });
    expect(fetchProvider).not.toHaveBeenCalled();
  });

  it('prunes only old unregistered endpoints for this connection', async () => {
    const apiUrl = 'https://twenty.example.com';
    vi.stubEnv('TWENTY_API_URL', apiUrl);
    vi.useFakeTimers();
    vi.setSystemTime('2026-11-19T04:30:00.000Z');
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    vi.mocked(kv.get).mockImplementation(async (key) => {
      if (key === getGranolaPersonalFolderSelectionKey(OWN_CONNECTION.id)) {
        return [];
      }
      if (key === getGranolaPersonalWebhookKey(OWN_CONNECTION.id)) {
        return vi.mocked(kv.delete).mock.calls.length > 0
          ? { webhookEndpointId: 'whe_new_registration' }
          : undefined;
      }
      return undefined;
    });
    const endpoint = {
      id: 'whe_abandoned',
      object: 'webhook_endpoint',
      url: getGranolaWebhookDestinationUrlOrThrow({
        apiUrl,
        registrationId: getGranolaPersonalRegistrationId(OWN_CONNECTION.id),
      }),
      url_redacted: false,
      events: ['note.generated'],
      folder_ids: [],
      scopes: ['personal'],
      created_by: null,
      enabled: true,
      created_at: '2026-11-19T04:00:00.000Z',
    };
    const fetchProvider = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          webhook_endpoints: [
            endpoint,
            { ...endpoint, id: 'whe_new_registration' },
            { ...endpoint, id: 'whe_redacted', url_redacted: true },
            {
              ...endpoint,
              id: 'whe_fresh',
              created_at: '2026-11-19T04:29:59.000Z',
            },
            {
              ...endpoint,
              id: 'whe_unrelated',
              url: 'https://other.example.com',
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          id: endpoint.id,
          object: endpoint.object,
          deleted: true,
        }),
      );
    vi.stubGlobal('fetch', fetchProvider);

    await granolaPersonalReconcileHandler({
      connectedAccountId: OWN_CONNECTION.id,
      userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
      scheduledApiKeyFingerprint: getGranolaApiKeyFingerprint(
        OWN_CONNECTION.accessToken ?? '',
      ),
    });

    expect(fetchProvider).toHaveBeenCalledTimes(2);
    expect(fetchProvider).toHaveBeenLastCalledWith(
      new URL(
        'https://public-api.granola.ai/v1/webhook-endpoints/whe_abandoned',
      ),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
