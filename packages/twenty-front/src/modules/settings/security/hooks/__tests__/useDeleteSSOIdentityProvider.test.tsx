/* @license Enterprise */

import { renderHook } from '@testing-library/react';

import { useDeleteSSOIdentityProvider } from '@/settings/security/hooks/useDeleteSSOIdentityProvider';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationDeleteSSOIDPCallSpy = jest.fn();

jest.mock('~/generated-metadata/graphql', () => ({
  useDeleteSsoIdentityProviderMutation: () => [mutationDeleteSSOIDPCallSpy],
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useDeleteSsoIdentityProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delete SSO identity provider', async () => {
    const params = { identityProviderId: 'test' };
    renderHook(
      () => {
        const { deleteSSOIdentityProvider } = useDeleteSSOIdentityProvider();
        deleteSSOIdentityProvider(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationDeleteSSOIDPCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input: params,
      },
    });
  });
});
