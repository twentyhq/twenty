import { act, renderHook } from '@testing-library/react';

import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';

const mockTriggerAppOAuth = jest.fn();
const mockOpenConnectApplicationWithApiKeyInSidePanel = jest.fn();

jest.mock('@/settings/applications/hooks/useTriggerAppOAuth', () => ({
  useTriggerAppOAuth: () => ({ triggerAppOAuth: mockTriggerAppOAuth }),
}));

jest.mock(
  '@/side-panel/hooks/useOpenConnectApplicationWithApiKeyInSidePanel',
  () => ({
    useOpenConnectApplicationWithApiKeyInSidePanel: () => ({
      openConnectApplicationWithApiKeyInSidePanel:
        mockOpenConnectApplicationWithApiKeyInSidePanel,
    }),
  }),
);

describe('useStartAppConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('asks for the key in the side panel for an api-key provider', async () => {
    const { result } = renderHook(() => useStartAppConnection());

    await act(() =>
      result.current.startAppConnection({
        applicationId: 'app-1',
        connectionProvider: {
          name: 'front',
          displayName: 'Front',
          type: 'api-key',
        },
        reconnectingConnectedAccountId: 'account-1',
        redirectLocation: '/settings/applications/app-1',
      }),
    );

    expect(
      mockOpenConnectApplicationWithApiKeyInSidePanel,
    ).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'front',
      providerDisplayName: 'Front',
      reconnectingConnectedAccountId: 'account-1',
    });
    expect(mockTriggerAppOAuth).not.toHaveBeenCalled();
  });

  it('signs in on the provider side for any other provider', async () => {
    const { result } = renderHook(() => useStartAppConnection());

    await act(() =>
      result.current.startAppConnection({
        applicationId: 'app-1',
        connectionProvider: {
          name: 'linear',
          displayName: 'Linear',
          type: 'oauth',
        },
        redirectLocation: '/settings/applications/app-1',
      }),
    );

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'linear',
      reconnectingConnectedAccountId: undefined,
      redirectLocation: '/settings/applications/app-1',
    });
    expect(
      mockOpenConnectApplicationWithApiKeyInSidePanel,
    ).not.toHaveBeenCalled();
  });
});
