import { useAuth } from '@/auth/hooks/useAuth';
import { billingState } from '@/client-config/states/billingState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { supportChatState } from '@/client-config/states/supportChatState';

import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useApolloClient } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { expect } from '@storybook/test';
import { type ReactNode, act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { renderHook } from '@testing-library/react';
import { iconsState } from 'twenty-ui/display';
import { SupportDriver } from '~/generated/graphql';
import {
  email,
  mocks,
  password,
  results,
  token,
} from '@/auth/hooks/__mocks__/useAuth';

const redirectSpy = jest.fn();

jest.mock('@/domain-manager/hooks/useRedirect', () => ({
  useRedirect: jest.fn().mockImplementation(() => ({
    redirect: redirectSpy,
  })),
}));

jest.mock('@/object-metadata/hooks/useRefreshObjectMetadataItems', () => ({
  useRefreshObjectMetadataItems: jest.fn().mockImplementation(() => ({
    refreshObjectMetadataItems: jest.fn(),
  })),
}));

jest.mock('@/domain-manager/hooks/useOrigin', () => ({
  useOrigin: jest.fn().mockImplementation(() => ({
    origin: 'http://localhost',
  })),
}));

jest.mock('@/captcha/hooks/useRequestFreshCaptchaToken', () => ({
  useRequestFreshCaptchaToken: jest.fn().mockImplementation(() => ({
    requestFreshCaptchaToken: jest.fn(),
  })),
}));

jest.mock('@/auth/sign-in-up/hooks/useSignUpInNewWorkspace', () => ({
  useSignUpInNewWorkspace: jest.fn().mockImplementation(() => ({
    createWorkspace: jest.fn(),
  })),
}));

jest.mock('@/domain-manager/hooks/useRedirectToWorkspaceDomain', () => ({
  useRedirectToWorkspaceDomain: jest.fn().mockImplementation(() => ({
    redirectToWorkspaceDomain: jest.fn(),
  })),
}));

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace', () => ({
  useIsCurrentLocationOnAWorkspace: jest.fn().mockImplementation(() => ({
    isOnAWorkspace: true,
  })),
}));

jest.mock('@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain', () => ({
  useLastAuthenticatedWorkspaceDomain: jest.fn().mockImplementation(() => ({
    setLastAuthenticateWorkspaceDomain: jest.fn(),
  })),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={Object.values(mocks)} addTypename={false}>
    <RecoilRoot>
      <MemoryRouter>
        <SnackBarComponentInstanceContext.Provider
          value={{ instanceId: 'test-instance-id' }}
        >
          {children}
        </SnackBarComponentInstanceContext.Provider>
      </MemoryRouter>
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

  it('should return login token object', async () => {
    const { result } = renderHooks();

    await act(async () => {
      expect(
        await result.current.getLoginTokenFromCredentials(email, password),
      ).toStrictEqual(results.getLoginTokenFromCredentials);
    });

    expect(mocks.getLoginTokenFromCredentials.result).toHaveBeenCalled();
  });

  it('should verify user', async () => {
    const { result } = renderHooks();

    await act(async () => {
      await result.current.getAuthTokensFromLoginToken(token);
    });

    expect(mocks.getAuthTokensFromLoginToken.result).toHaveBeenCalled();
    expect(mocks.getCurrentUser.result).toHaveBeenCalled();
  });

  it('should handle credential sign-in', async () => {
    const { result } = renderHooks();

    await act(async () => {
      await result.current.signInWithCredentialsInWorkspace(email, password);
    });

    expect(mocks.getLoginTokenFromCredentials.result).toHaveBeenCalled();
    expect(mocks.getAuthTokensFromLoginToken.result).toHaveBeenCalled();
  });

  it('should handle google sign-in', async () => {
    const { result } = renderHooks();

    await act(async () => {
      await result.current.signInWithGoogle({
        workspaceInviteHash: 'workspaceInviteHash',
        action: 'join-workspace',
      });
    });

    expect(redirectSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '/auth/google?workspaceInviteHash=workspaceInviteHash',
      ),
    );
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
    expect(state.workspaceAuthProviders).toEqual(null);
    expect(state.billing).toBeNull();
    expect(state.isDeveloperDefaultSignInPrefilled).toBe(false);
    expect(state.supportChat).toEqual({
      supportDriver: SupportDriver.NONE,
      supportFrontChatId: null,
    });
  });

  it('should handle credential sign-up', async () => {
    const { result } = renderHooks();

    await act(async () => {
      await result.current.signUpWithCredentialsInWorkspace({
        email,
        password,
      });
    });

    expect(mocks.signUpInWorkspace.result).toHaveBeenCalled();
  });
});
