import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type ReactNode } from 'react';

import { PendingServerSignOutEffect } from '@/auth/effect-components/PendingServerSignOutEffect';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isPendingServerSignOutState } from '@/auth/states/isPendingServerSignOutState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';

const mockMutate = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ mutate: mockMutate }),
}));

const renderEffect = ({
  isLoadedOnce = true,
  isPendingServerSignOut = true,
  isCookieAuthActive = false,
}: {
  isLoadedOnce?: boolean;
  isPendingServerSignOut?: boolean;
  isCookieAuthActive?: boolean;
} = {}) => {
  const store = createStore();

  store.set(clientConfigApiStatusState.atom, {
    isLoadedOnce,
    isLoading: false,
    isErrored: false,
    isSaved: false,
  });
  store.set(isPendingServerSignOutState.atom, isPendingServerSignOut);
  store.set(isCookieAuthActiveState.atom, isCookieAuthActive);

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

  // A retry is issued seconds later and carries whatever cookie exists by then,
  // so it would revoke a session established in the meantime.
  it('should not let the sign out be retried', async () => {
    renderEffect();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ context: { skipRetry: true } }),
    );
  });

  // The pending sign-out is stale once a new session exists; firing it would
  // revoke the session the user just got.
  it('should drop the pending sign out when a session is already active', async () => {
    const store = renderEffect({ isCookieAuthActive: true });

    await waitFor(() =>
      expect(store.get(isPendingServerSignOutState.atom)).toBe(false),
    );
    expect(mockMutate).not.toHaveBeenCalled();
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
