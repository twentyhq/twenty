/* @license Enterprise */

import { renderHook } from '@testing-library/react';

import { useDeleteSsoIdentityProvider } from '@/settings/security/hooks/useDeleteSsoIdentityProvider';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationDeleteSsoIdpCallSpy = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mutationDeleteSsoIdpCallSpy],
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
        const { deleteSsoIdentityProvider } = useDeleteSsoIdentityProvider();
        deleteSsoIdentityProvider(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationDeleteSsoIdpCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input: params,
      },
    });
  });
});
