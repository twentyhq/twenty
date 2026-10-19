import { useMutation } from '@apollo/client/react';
import { act, renderHook } from '@testing-library/react';

import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';

const mockRedirect = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: jest.fn(),
}));

jest.mock('@/domain-manager/hooks/useRedirect', () => ({
  useRedirect: () => ({ redirect: mockRedirect }),
}));

describe('useTriggerAppOAuth', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    jest.mocked(useMutation).mockReturnValue([
      jest.fn().mockResolvedValue({
        data: {
          generateTransientToken: { transientToken: { token: 'transient' } },
        },
      }),
    ] as unknown as ReturnType<typeof useMutation>);
  });

  it('asks the server for the scope and the visibility previous releases read', async () => {
    const { result } = renderHook(() => useTriggerAppOAuth());

    await act(() =>
      result.current.triggerAppOAuth({
        applicationId: 'app-1',
        providerName: 'linear',
        scope: 'WORKSPACE',
        reconnectingConnectedAccountId: 'account-1',
      }),
    );

    const authorizeUrl = new URL(mockRedirect.mock.calls[0][0], 'http://test');

    expect(authorizeUrl.pathname).toMatch(/\/auth\/apps\/authorize$/);
    expect(Object.fromEntries(authorizeUrl.searchParams)).toEqual({
      applicationId: 'app-1',
      providerName: 'linear',
      transientToken: 'transient',
      scope: 'WORKSPACE',
      visibility: 'workspace',
      reconnectingConnectedAccountId: 'account-1',
    });
  });
});
