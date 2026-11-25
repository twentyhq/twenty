import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const mocks = vi.hoisted(() => ({
  listMessageChannels: vi.fn(),
  updateMessageChannel: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  definePostInstallLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listMessageChannels: mocks.listMessageChannels,
  updateMessageChannel: mocks.updateMessageChannel,
}));

const { linkedinPostInstallHandler } =
  await import('src/logic-functions/linkedin-post-install');

describe('linkedinPostInstallHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lets members reply in the channels connected before replies existed', async () => {
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-1', messagingProviderUniversalIdentifier: null },
      {
        id: 'channel-2',
        messagingProviderUniversalIdentifier:
          LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    ]);

    await expect(linkedinPostInstallHandler()).resolves.toEqual({
      boundChannelCount: 1,
    });
    expect(mocks.listMessageChannels).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.updateMessageChannel).toHaveBeenCalledExactlyOnceWith({
      id: 'channel-1',
      messagingProvider: {
        universalIdentifier: LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('changes nothing when no LinkedIn account is connected', async () => {
    mocks.listMessageChannels.mockResolvedValue([]);

    await expect(linkedinPostInstallHandler()).resolves.toEqual({
      boundChannelCount: 0,
    });
    expect(mocks.updateMessageChannel).not.toHaveBeenCalled();
  });
});
