/* @license Enterprise */

import { renderHook } from '@testing-library/react';

import { useUpdateSSOIdentityProvider } from '@/settings/security/hooks/useUpdateSSOIdentityProvider';
import { SsoIdentityProviderStatus } from '~/generated/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationEditSSOIDPCallSpy = jest.fn();

jest.mock('~/generated-metadata/graphql', () => {
  const actual = jest.requireActual('~/generated-metadata/graphql');
  return {
    ...actual,
    useEditSsoIdentityProviderMutation: () => [mutationEditSSOIDPCallSpy],
  };
});

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
        const { updateSSOIdentityProvider } = useUpdateSSOIdentityProvider();
        updateSSOIdentityProvider(params);
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
