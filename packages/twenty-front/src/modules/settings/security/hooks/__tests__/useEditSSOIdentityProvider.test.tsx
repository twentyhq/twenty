/* @license Enterprise */

import { renderHook } from '@testing-library/react';

import { useUpdateSsoIdentityProvider } from '@/settings/security/hooks/useUpdateSsoIdentityProvider';
import { SsoIdentityProviderStatus } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationEditSsoIDPCallSpy = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mutationEditSsoIDPCallSpy],
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useEditSsoIdentityProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deactivate Sso identity provider', async () => {
    const params = {
      id: 'test',
      status: SsoIdentityProviderStatus.Inactive,
    };
    renderHook(
      () => {
        const { updateSsoIdentityProvider } = useUpdateSsoIdentityProvider();
        updateSsoIdentityProvider(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationEditSsoIDPCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input: params,
      },
    });
  });
});
