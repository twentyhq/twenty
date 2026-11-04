import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PERSON_LINKEDIN_LINK_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/person-linkedin-link-field-universal-identifier.constant';
import { LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  listMessageChannels: vi.fn(),
  createMessageChannel: vi.fn(),
  updateMessageChannel: vi.fn(),
  kvSet: vi.fn(),
  kvGet: vi.fn(),
  enqueueJobs: vi.fn(),
  getUnipileUser: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
  listMessageChannels: mocks.listMessageChannels,
  createMessageChannel: mocks.createMessageChannel,
  updateMessageChannel: mocks.updateMessageChannel,
  enqueueJobs: mocks.enqueueJobs,
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

vi.mock('src/unipile/utils/get-unipile-user.util', () => ({
  getUnipileUser: mocks.getUnipileUser,
}));

const { linkedinOnConnectHandler } =
  await import('src/logic-functions/linkedin-on-connect');

const PAYLOAD = {
  connectionProviderId: 'provider-id',
  connectionProviderName: 'linkedin',
  connectedAccountId: 'connected-account-id',
};

describe('linkedinOnConnectHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listMessageChannels.mockResolvedValue([]);
    mocks.getUnipileUser.mockResolvedValue({
      id: 'ACoME',
      display_name: 'Ada Lovelace',
      public_identifier: 'ada-lovelace',
    });
    mocks.createMessageChannel.mockResolvedValue({ id: 'channel-id' });
    mocks.kvGet.mockResolvedValue(null);
  });

  it('keeps a flat copy of the person LinkedIn field id, since deployed functions stub nested SDK constants', () => {
    expect(PERSON_LINKEDIN_LINK_FIELD_UNIVERSAL_IDENTIFIER).toBe(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.linkedinLink
        .universalIdentifier,
    );
  });

  it('creates a private channel on the member profile that replies go through, claims the account and leaves importing to the Sync button', async () => {
    await expect(linkedinOnConnectHandler(PAYLOAD)).resolves.toEqual({
      messageChannelId: 'channel-id',
    });

    expect(mocks.createMessageChannel).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      handle: 'https://www.linkedin.com/in/ada-lovelace',
      displayName: 'Ada Lovelace',
      visibility: 'METADATA',
      participantHandleFieldUniversalIdentifier:
        PERSON_LINKEDIN_LINK_FIELD_UNIVERSAL_IDENTIFIER,
      messagingProvider: {
        universalIdentifier: LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });
    expect(mocks.kvSet).toHaveBeenCalledWith(
      'unipile-account:acc_1',
      undefined,
      { scope: 'SERVER' },
    );
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('reuses the channel of a reconnected account', async () => {
    mocks.listMessageChannels.mockResolvedValue([
      {
        id: 'existing-channel-id',
        messagingProviderUniversalIdentifier:
          LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    ]);

    await expect(linkedinOnConnectHandler(PAYLOAD)).resolves.toEqual({
      messageChannelId: 'existing-channel-id',
    });
    expect(mocks.createMessageChannel).not.toHaveBeenCalled();
    expect(mocks.updateMessageChannel).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('lets members reply through a reconnected channel created before replies existed', async () => {
    mocks.listMessageChannels.mockResolvedValue([
      {
        id: 'existing-channel-id',
        messagingProviderUniversalIdentifier: null,
      },
    ]);

    await expect(linkedinOnConnectHandler(PAYLOAD)).resolves.toEqual({
      messageChannelId: 'existing-channel-id',
    });
    expect(mocks.updateMessageChannel).toHaveBeenCalledExactlyOnceWith({
      id: 'existing-channel-id',
      messagingProvider: {
        universalIdentifier: LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });
    expect(mocks.createMessageChannel).not.toHaveBeenCalled();
  });
});
