import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PERSON_PHONES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/person-phones-field-universal-identifier.constant';
import { WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  listMessageChannels: vi.fn(),
  createMessageChannel: vi.fn(),
  kvSet: vi.fn(),
  kvGet: vi.fn(),
  enqueueJobs: vi.fn(),
  getUnipileAccount: vi.fn(),
  getUnipileUser: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
  listMessageChannels: mocks.listMessageChannels,
  createMessageChannel: mocks.createMessageChannel,
  enqueueJobs: mocks.enqueueJobs,
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

vi.mock('src/unipile/utils/get-unipile-account.util', () => ({
  getUnipileAccount: mocks.getUnipileAccount,
}));

vi.mock('src/unipile/utils/get-unipile-user.util', () => ({
  getUnipileUser: mocks.getUnipileUser,
}));

const { whatsappOnConnectHandler } =
  await import('src/logic-functions/whatsapp-on-connect');

const PAYLOAD = {
  connectionProviderId: 'provider-id',
  connectionProviderName: 'whatsapp',
  connectedAccountId: 'connected-account-id',
};

describe('whatsappOnConnectHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listMessageChannels.mockResolvedValue([]);
    mocks.getUnipileAccount.mockResolvedValue({
      id: 'acc_1',
      user_id: '33611111111@s.whatsapp.net',
      name: 'Ada Lovelace',
    });
    mocks.createMessageChannel.mockResolvedValue({ id: 'channel-id' });
    mocks.kvGet.mockResolvedValue(null);
  });

  it('keeps a flat copy of the person Phones field id, since deployed functions stub nested SDK constants', () => {
    expect(PERSON_PHONES_FIELD_UNIVERSAL_IDENTIFIER).toBe(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.phones
        .universalIdentifier,
    );
  });

  it('creates a private channel on the member phone number that replies go through, claims the account and imports its most recent conversations once WhatsApp handed them over', async () => {
    await expect(whatsappOnConnectHandler(PAYLOAD)).resolves.toEqual({
      messageChannelId: 'channel-id',
    });

    expect(mocks.createMessageChannel).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      handle: '+33611111111',
      displayName: 'Ada Lovelace',
      visibility: 'METADATA',
      participantHandleFieldUniversalIdentifier:
        PERSON_PHONES_FIELD_UNIVERSAL_IDENTIFIER,
      messagingProvider: {
        universalIdentifier: WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });
    expect(mocks.kvSet).toHaveBeenCalledWith(
      'unipile-account:acc_1',
      undefined,
      { scope: 'SERVER' },
    );
    expect(mocks.kvSet).toHaveBeenCalledWith(
      'whatsapp-history-import:connected-account-id',
      expect.objectContaining({
        status: 'IMPORTING',
        importPolicy: 'CONTACTS_ONLY',
        conversationLimit: 100,
      }),
    );
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ delayMs: 60 * 1000 }),
    );
  });

  it('reads the member phone number from the account name when Unipile puts it there', async () => {
    mocks.getUnipileAccount.mockResolvedValue({
      id: 'acc_1',
      user_id: '199912345678901@lid',
      name: '+33 6 11 11 11 11',
    });

    await whatsappOnConnectHandler(PAYLOAD);

    expect(mocks.createMessageChannel).toHaveBeenCalledWith(
      expect.objectContaining({
        handle: '+33611111111',
        displayName: undefined,
      }),
    );
    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
  });

  it('falls back to the member own profile when the account carries no phone number', async () => {
    mocks.getUnipileAccount.mockResolvedValue({
      id: 'acc_1',
      user_id: '199912345678901@lid',
      name: 'Ada Lovelace',
    });
    mocks.getUnipileUser.mockResolvedValue({
      id: '199912345678901@lid',
      public_identifier: '33611111111',
      display_name: 'Ada',
    });

    await whatsappOnConnectHandler(PAYLOAD);

    expect(mocks.getUnipileUser).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      userId: 'me',
    });
    expect(mocks.createMessageChannel).toHaveBeenCalledWith(
      expect.objectContaining({ handle: '+33611111111', displayName: 'Ada' }),
    );
  });

  it('fails the connection when Unipile exposes no phone number for the account', async () => {
    mocks.getUnipileAccount.mockResolvedValue({
      id: 'acc_1',
      user_id: '199912345678901@lid',
    });
    mocks.getUnipileUser.mockResolvedValue({
      id: '199912345678901@lid',
      display_name: 'Ada',
    });

    await expect(whatsappOnConnectHandler(PAYLOAD)).rejects.toThrow(
      'Unipile account acc_1 exposes no WhatsApp phone number',
    );
    expect(mocks.createMessageChannel).not.toHaveBeenCalled();
  });

  it('reuses the channel of a reconnected account and imports its conversations again', async () => {
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'existing-channel-id' },
    ]);

    await expect(whatsappOnConnectHandler(PAYLOAD)).resolves.toEqual({
      messageChannelId: 'existing-channel-id',
    });
    expect(mocks.createMessageChannel).not.toHaveBeenCalled();
    expect(mocks.getUnipileAccount).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).toHaveBeenCalledOnce();
  });
});
