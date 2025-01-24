import { useApolloClient } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { expect } from '@storybook/test';
import { ReactNode, act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { iconsState } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { billingState } from '@/client-config/states/billingState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { renderHook } from '@testing-library/react';
import { email, mocks, password, results, token } from '../__mocks__/useAuth';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <RecoilRoot>
      <MemoryRouter>{children}</MemoryRouter>
    </RecoilRoot>
  </MockedProvider>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      return useAuth();
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return challenge object', async () => {
    const { result } = renderHooks();

    await act(async () => {
      expect(await result.current.challenge(email, password)).toStrictEqual(
        results.challenge,
      );
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });

  it('should verify user', async () => {
    const { result } = renderHooks();

    await act(async () => {
      await result.current.verify(token);
    });

    expect(mocks[1].result).toHaveBeenCalled();
    expect(mocks[3].result).toHaveBeenCalled();
  });

  it('should handle credential sign-in', async () => {
    const { result } = renderHooks();

    await act(async () => {
      await result.current.signInWithCredentials(email, password);
    });

    expect(mocks[0].result).toHaveBeenCalled();
    expect(mocks[1].result).toHaveBeenCalled();
  });

  it('should handle sign-out', async () => {
    const { result } = renderHook(
      () => {
        const client = useApolloClient();
        const icons = useRecoilValue(iconsState);
        const workspaceAuthProviders = useRecoilValue(
          workspaceAuthProvidersState,
        );
        const billing = useRecoilValue(billingState);
        const isDeveloperDefaultSignInPrefilled = useRecoilValue(
          isDeveloperDefaultSignInPrefilledState,
        );
        const supportChat = useRecoilValue(supportChatState);
        const isDebugMode = useRecoilValue(isDebugModeState);
        const isMultiWorkspaceEnabled = useRecoilValue(
          isMultiWorkspaceEnabledState,
        );
        return {
          ...useAuth(),
          client,
          state: {
            icons,
            workspaceAuthProviders,
            billing,
            isDeveloperDefaultSignInPrefilled,
            supportChat,
            isDebugMode,
            isMultiWorkspaceEnabled,
          },
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const { signOut, client } = result.current;

    await act(async () => {
      await signOut();
    });

    expect(sessionStorage.length).toBe(0);
    expect(client.cache.extract()).toEqual({});

    const { state } = result.current;

    expect(state.icons).toEqual({});
    expect(state.workspaceAuthProviders).toEqual({
      google: true,
      microsoft: false,
      magicLink: false,
      password: true,
      sso: [],
    });
    expect(state.billing).toBeNull();
    expect(state.isDeveloperDefaultSignInPrefilled).toBe(false);
    expect(state.supportChat).toEqual({
      supportDriver: 'none',
      supportFrontChatId: null,
    });
    expect(state.isDebugMode).toBe(false);
  });

  it('should handle credential sign-up', async () => {
    const { result } = renderHooks();

    await act(async () => {
      await result.current.signUpWithCredentials(email, password);
    });

    expect(mocks[2].result).toHaveBeenCalled();
  });
});
