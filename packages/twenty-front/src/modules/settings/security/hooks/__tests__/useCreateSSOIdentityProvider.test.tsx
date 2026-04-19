/* @license Enterprise */

import { renderHook } from '@testing-library/react';

import { useCreateSsoIdentityProvider } from '@/settings/security/hooks/useCreateSsoIdentityProvider';
import {
  CreateOidcIdentityProviderDocument,
  CreateSamlIdentityProviderDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationOidcCallSpy = jest.fn();
const mutationSamlCallSpy = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: (document: unknown) => {
    if (document === CreateOidcIdentityProviderDocument) {
      return [mutationOidcCallSpy];
    }
    if (document === CreateSamlIdentityProviderDocument) {
      return [mutationSamlCallSpy];
    }
    return [jest.fn()];
  },
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useCreateSsoIdentityProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create Oidc Sso identity provider', async () => {
    const OidcParams = {
      type: 'Oidc' as const,
      name: 'test',
      clientId: 'test',
      clientSecret: 'test',
      issuer: 'test',
    };
    renderHook(
      () => {
        const { createSsoIdentityProvider } = useCreateSsoIdentityProvider();
        createSsoIdentityProvider(OidcParams);
      },
      { wrapper: Wrapper },
    );

    // oxlint-disable-next-line unused-imports/no-unused-vars
    const { type, ...input } = OidcParams;
    expect(mutationOidcCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input,
      },
    });
  });
  it('create Saml Sso identity provider', async () => {
    const SamlParams = {
      type: 'Saml' as const,
      name: 'test',
      metadata: 'test',
      certificate: 'test',
      id: 'test',
      issuer: 'test',
      ssoUrl: 'test',
    };
    renderHook(
      () => {
        const { createSsoIdentityProvider } = useCreateSsoIdentityProvider();
        createSsoIdentityProvider(SamlParams);
      },
      { wrapper: Wrapper },
    );

    // oxlint-disable-next-line unused-imports/no-unused-vars
    const { type, ...input } = SamlParams;
    expect(mutationOidcCallSpy).not.toHaveBeenCalled();
    expect(mutationSamlCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input,
      },
    });
  });
  it('throw error if provider is not Saml or Oidc', async () => {
    const OTHERParams = {
      type: 'OTHER' as const,
    };
    const { result } = renderHook(() => useCreateSsoIdentityProvider(), {
      wrapper: Wrapper,
    });

    await expect(
      // @ts-expect-error - It's expected to throw an error
      result.current.createSsoIdentityProvider(OTHERParams),
    ).rejects.toThrow('Invalid IdpType');
  });
});
