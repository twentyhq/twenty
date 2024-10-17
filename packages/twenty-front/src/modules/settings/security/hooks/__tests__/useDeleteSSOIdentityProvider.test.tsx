/* @license Enterprise */

import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useDeleteSSOIdentityProvider } from '@/settings/security/hooks/useDeleteSSOIdentityProvider';

const mutationDeleteSSOIDPCallSpy = jest.fn();

jest.mock('~/generated/graphql', () => ({
  useDeleteSsoIdentityProviderMutation: () => [mutationDeleteSSOIDPCallSpy],
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useDeleteSsoIdentityProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delete SSO identity provider', async () => {
    renderHook(
      () => {
        const { deleteSSOIdentityProvider } = useDeleteSSOIdentityProvider();
        deleteSSOIdentityProvider({ identityProviderId: 'test' });
      },
      { wrapper: Wrapper },
    );

    expect(mutationDeleteSSOIDPCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input: { identityProviderId: 'test' },
      },
    });
  });
});
