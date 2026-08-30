import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type ReactNode } from 'react';

import { PendingServerSignOutEffect } from '@/auth/effect-components/PendingServerSignOutEffect';
import { isPendingServerSignOutState } from '@/auth/states/isPendingServerSignOutState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';

const mockMutate = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ mutate: mockMutate }),
}));

const renderEffect = ({
  isLoadedOnce = true,
  isPendingServerSignOut = true,
}: {
  isLoadedOnce?: boolean;
  isPendingServerSignOut?: boolean;
} = {}) => {
  const store = createStore();

  store.set(clientConfigApiStatusState.atom, {
    isLoadedOnce,
    isLoading: false,
    isErrored: false,
    isSaved: false,
  });
  store.set(isPendingServerSignOutState.atom, isPendingServerSignOut);

  renderHook(() => PendingServerSignOutEffect(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

  return store;
};

describe('PendingServerSignOutEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockResolvedValue({ data: { signOut: true } });
  });

  it('should revoke the session left behind by a sign out that never reached the server', async () => {
    const store = renderEffect();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(store.get(isPendingServerSignOutState.atom)).toBe(false),
    );
  });

  it('should keep the retry pending when the server is still unreachable', async () => {
    mockMutate.mockRejectedValue(new Error('Network error'));

    const store = renderEffect();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    expect(store.get(isPendingServerSignOutState.atom)).toBe(true);
  });

  it('should not sign out a session the user never asked to end', async () => {
    renderEffect({ isPendingServerSignOut: false });

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled());
  });

  it('should wait for the api before retrying', async () => {
    renderEffect({ isLoadedOnce: false });

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled());
  });
});
