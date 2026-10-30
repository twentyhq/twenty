import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  removeLinkedinConnectionResources: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
}));

vi.mock(
  'src/logic-functions/utils/remove-linkedin-connection-resources.util',
  () => ({
    removeLinkedinConnectionResources: mocks.removeLinkedinConnectionResources,
  }),
);

const { linkedinOnDisconnectHandler } =
  await import('src/logic-functions/linkedin-on-disconnect');

const PAYLOAD = {
  connectionProviderId: 'provider-id',
  connectionProviderName: 'linkedin',
  connectedAccountId: 'connection-id',
};

describe('linkedinOnDisconnectHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('removes the Unipile account of the connection', async () => {
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });

    await linkedinOnDisconnectHandler(PAYLOAD);

    expect(mocks.getConnection).toHaveBeenCalledExactlyOnceWith(
      'connection-id',
    );
    expect(
      mocks.removeLinkedinConnectionResources,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: 'acc_1',
    });
  });

  it('still removes the channel once the connection is gone', async () => {
    mocks.getConnection.mockRejectedValue(new Error('Connection not found'));

    await linkedinOnDisconnectHandler(PAYLOAD);

    expect(
      mocks.removeLinkedinConnectionResources,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: null,
    });
  });
});
