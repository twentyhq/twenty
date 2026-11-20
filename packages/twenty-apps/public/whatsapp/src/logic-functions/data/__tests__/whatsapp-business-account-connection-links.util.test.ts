import { beforeEach, describe, expect, it, vi } from 'vitest';
import { linkWhatsAppBusinessAccountsToConnection } from 'src/logic-functions/data/link-whatsapp-business-accounts-to-connection.util';
import { unlinkConnectionFromWhatsAppBusinessAccounts } from 'src/logic-functions/data/unlink-connection-from-whatsapp-business-accounts.util';
import { findConnectedAccountIdByWhatsAppBusinessAccountId } from 'src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util';

const store = new Map<string, unknown>();

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      store.set(key, value);
    },
    delete: async (key: string) => store.delete(key),
  },
}));

describe('WhatsApp Business Account connection links', () => {
  beforeEach(() => {
    store.clear();
  });

  it('should link each account to its connection', async () => {
    await linkWhatsAppBusinessAccountsToConnection({
      connectedAccountId: 'connection-1',
      whatsAppBusinessAccountIds: ['waba-1', 'waba-2'],
    });

    expect(await findConnectedAccountIdByWhatsAppBusinessAccountId('waba-1')).toBe('connection-1');
    expect(await findConnectedAccountIdByWhatsAppBusinessAccountId('waba-2')).toBe('connection-1');
  });

  it('should drop accounts the token lost access to on reconnect', async () => {
    await linkWhatsAppBusinessAccountsToConnection({
      connectedAccountId: 'connection-1',
      whatsAppBusinessAccountIds: ['waba-1', 'waba-2'],
    });
    await linkWhatsAppBusinessAccountsToConnection({
      connectedAccountId: 'connection-1',
      whatsAppBusinessAccountIds: ['waba-1'],
    });

    expect(await findConnectedAccountIdByWhatsAppBusinessAccountId('waba-2')).toBeUndefined();
  });

  it('should keep an account another connection took over when disconnecting', async () => {
    await linkWhatsAppBusinessAccountsToConnection({
      connectedAccountId: 'connection-1',
      whatsAppBusinessAccountIds: ['waba-1', 'waba-2'],
    });
    await linkWhatsAppBusinessAccountsToConnection({
      connectedAccountId: 'connection-2',
      whatsAppBusinessAccountIds: ['waba-2'],
    });

    await unlinkConnectionFromWhatsAppBusinessAccounts('connection-1');

    expect(await findConnectedAccountIdByWhatsAppBusinessAccountId('waba-1')).toBeUndefined();
    expect(await findConnectedAccountIdByWhatsAppBusinessAccountId('waba-2')).toBe('connection-2');
  });
});
