import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { SsoIdentityProviderStatus } from '~/generated/graphql';
import { useEditSSOIdentityProvider } from '@/settings/security/hooks/useEditSSOIdentityProvider';

const mutationEditSSOIDPCallSpy = jest.fn();

jest.mock('~/generated/graphql', () => {
  const actual = jest.requireActual('~/generated/graphql');
  return {
    useEditSsoIdentityProviderMutation: () => [mutationEditSSOIDPCallSpy],
    SsoIdentityProviderStatus: actual.SsoIdentityProviderStatus,
  };
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useEditSsoIdentityProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deactivate SSO identity provider', async () => {
    const params = {
      id: 'test',
      status: SsoIdentityProviderStatus.Inactive,
    };
    renderHook(
      () => {
        const { editSSOIdentityProvider } = useEditSSOIdentityProvider();
        editSSOIdentityProvider(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationEditSSOIDPCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input: params,
      },
    });
  });
});
