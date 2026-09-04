/* @license Enterprise */

import { renderHook } from '@testing-library/react';

import { useUpdateSsoIdentityProvider } from '@/settings/security/hooks/useUpdateSsoIdentityProvider';
import { SsoIdentityProviderStatus } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationEditSsoIdpCallSpy = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mutationEditSsoIdpCallSpy],
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

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
        const { updateSsoIdentityProvider } = useUpdateSsoIdentityProvider();
        updateSsoIdentityProvider(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationEditSsoIdpCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input: params,
      },
    });
  });
});
