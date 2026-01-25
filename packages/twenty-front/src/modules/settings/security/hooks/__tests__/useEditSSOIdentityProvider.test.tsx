/* @license Enterprise */

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useUpdateSSOIdentityProvider } from '@/settings/security/hooks/useUpdateSSOIdentityProvider';
import { SsoIdentityProviderStatus } from '~/generated/graphql';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

const mutationEditSSOIDPCallSpy = vi.fn();

vi.mock('~/generated-metadata/graphql', async () => {
  const actual = await vi.importActual('~/generated-metadata/graphql');
  return {
    ...actual,
    useEditSsoIdentityProviderMutation: () => [mutationEditSSOIDPCallSpy],
  };
});

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useEditSsoIdentityProvider', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
