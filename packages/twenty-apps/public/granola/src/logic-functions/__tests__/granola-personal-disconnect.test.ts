import { getConnection, kv } from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GRANOLA_PERSONAL_REGISTRATION_PREFIX } from 'src/constants/granola-personal-connection.constant';
import { OWN_CONNECTION } from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { granolaPersonalDisconnectHandler } from 'src/logic-functions/granola-personal-disconnect';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  getConnection: vi.fn(),
  kv: { get: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('granolaPersonalDisconnectHandler', () => {
  it('revokes the selection and claim even if Granola refuses to delete the webhook', async () => {
    const connectionId = OWN_CONNECTION.id;
    vi.mocked(getConnection).mockResolvedValue(OWN_CONNECTION);
    vi.mocked(kv.get).mockResolvedValue({ webhookEndpointId: 'whe_stale' });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 403 })),
    );

    await expect(
      granolaPersonalDisconnectHandler({ connectedAccountId: connectionId }),
    ).resolves.toEqual({ success: true });

    expect(kv.delete).toHaveBeenCalledWith(
      getGranolaPersonalFolderSelectionKey(connectionId),
    );
    expect(kv.delete).toHaveBeenCalledWith(
      getGranolaRegistrationClaimKey(
        GRANOLA_PERSONAL_REGISTRATION_PREFIX + connectionId,
      ),
      { scope: 'SERVER' },
    );
    expect(kv.delete).toHaveBeenCalledWith(
      getGranolaPersonalWebhookKey(connectionId),
    );
  });
});
