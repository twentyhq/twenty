/* @license Enterprise */

import { renderHook } from '@testing-library/react';

import { useDeleteSsoIdentityProvider } from '@/settings/security/hooks/useDeleteSsoIdentityProvider';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationDeleteSsoIDPCallSpy = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mutationDeleteSsoIDPCallSpy],
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useDeleteSsoIdentityProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delete Sso identity provider', async () => {
    const params = { identityProviderId: 'test' };
    renderHook(
      () => {
        const { deleteSsoIdentityProvider } = useDeleteSsoIdentityProvider();
        deleteSsoIdentityProvider(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationDeleteSsoIDPCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input: params,
      },
    });
  });
});
