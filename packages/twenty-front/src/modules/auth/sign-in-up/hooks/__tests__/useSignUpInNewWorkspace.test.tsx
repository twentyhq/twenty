import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import Cookies from 'js-cookie';
import { type ReactNode } from 'react';

import { useSignUpInNewWorkspace } from '@/auth/sign-in-up/hooks/useSignUpInNewWorkspace';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const signUpInNewWorkspaceMutationMock = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [signUpInNewWorkspaceMutationMock],
}));

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: () => ({ getAuthTokensFromLoginToken: jest.fn() }),
}));

jest.mock('@/auth/sign-in-up/hooks/useUploadNewWorkspaceLogo', () => ({
  useUploadNewWorkspaceLogo: () => ({ uploadNewWorkspaceLogo: jest.fn() }),
}));

jest.mock('@/domain-manager/hooks/useRedirectToWorkspaceDomain', () => ({
  useRedirectToWorkspaceDomain: () => ({
    redirectToWorkspaceDomain: jest.fn(),
  }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

const storePartnerCookie = (partner: string) => {
  Cookies.set('partner', JSON.stringify({ partner }), {
    domain: '.localhost',
  });
};

const createWorkspace = async () => {
  const { result } = renderHook(() => useSignUpInNewWorkspace(), {
    wrapper: Wrapper,
  });

  await act(async () => {
    await result.current.createWorkspace({ displayName: 'Acme' });
  });
};

describe('useSignUpInNewWorkspace', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(isMultiWorkspaceEnabledState.atom, true);
    jotaiStore.set(domainConfigurationState.atom, {
      frontDomain: 'localhost',
      defaultSubdomain: 'app',
      publicFunctionDomain: undefined,
      serverUrl: 'http://localhost:3000',
    });
    signUpInNewWorkspaceMutationMock.mockResolvedValue({
      data: {
        signUpInNewWorkspace: {
          loginToken: { token: 'login-token' },
          workspace: {
            id: 'workspace-id',
            workspaceUrls: {
              subdomainUrl: 'https://acme.twenty.com',
              customUrl: null,
            },
          },
        },
      },
    });
  });

  afterEach(() => {
    Cookies.remove('partner', { domain: '.localhost' });
    jest.clearAllMocks();
  });

  it('should send the stored partner and clear it once the workspace is created', async () => {
    storePartnerCookie('acme');

    await createWorkspace();

    expect(signUpInNewWorkspaceMutationMock).toHaveBeenCalledWith({
      variables: { input: { displayName: 'Acme', partner: 'acme' } },
    });
    expect(Cookies.get('partner')).toBeUndefined();
  });

  it('should ignore a stored partner that is not normalized', async () => {
    storePartnerCookie('Acme');

    await createWorkspace();

    const [[{ variables }]] = signUpInNewWorkspaceMutationMock.mock.calls;

    expect(variables.input.partner).toBeUndefined();
  });

  it('should keep the partner when the workspace creation fails', async () => {
    storePartnerCookie('acme');
    signUpInNewWorkspaceMutationMock.mockRejectedValue(new Error('failed'));

    await createWorkspace();

    expect(Cookies.get('partner')).toBe(JSON.stringify({ partner: 'acme' }));
  });
});
