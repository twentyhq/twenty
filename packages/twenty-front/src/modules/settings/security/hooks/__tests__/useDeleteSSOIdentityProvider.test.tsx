/* @license Enterprise */

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useDeleteSSOIdentityProvider } from '@/settings/security/hooks/useDeleteSSOIdentityProvider';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

const mutationDeleteSSOIDPCallSpy = vi.fn();

vi.mock('~/generated-metadata/graphql', () => ({
  useDeleteSsoIdentityProviderMutation: () => [mutationDeleteSSOIDPCallSpy],
}));

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useDeleteSsoIdentityProvider', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
