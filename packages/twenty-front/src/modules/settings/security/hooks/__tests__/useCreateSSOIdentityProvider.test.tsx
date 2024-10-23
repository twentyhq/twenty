/* @license Enterprise */

import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useCreateSSOIdentityProvider } from '@/settings/security/hooks/useCreateSSOIdentityProvider';

const mutationOIDCCallSpy = jest.fn();
const mutationSAMLCallSpy = jest.fn();

jest.mock('~/generated/graphql', () => ({
  useCreateOidcIdentityProviderMutation: () => [mutationOIDCCallSpy],
  useCreateSamlIdentityProviderMutation: () => [mutationSAMLCallSpy],
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useCreateSSOIdentityProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create OIDC sso identity provider', async () => {
    const OIDCParams = {
      type: 'OIDC' as const,
      name: 'test',
      clientID: 'test',
      clientSecret: 'test',
      issuer: 'test',
    };
    renderHook(
      () => {
        const { createSSOIdentityProvider } = useCreateSSOIdentityProvider();
        createSSOIdentityProvider(OIDCParams);
      },
      { wrapper: Wrapper },
    );

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { type, ...input } = OIDCParams;
    expect(mutationOIDCCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input,
      },
    });
  });
  it('create SAML sso identity provider', async () => {
    const SAMLParams = {
      type: 'SAML' as const,
      name: 'test',
      metadata: 'test',
      certificate: 'test',
      id: 'test',
      issuer: 'test',
      ssoURL: 'test',
    };
    renderHook(
      () => {
        const { createSSOIdentityProvider } = useCreateSSOIdentityProvider();
        createSSOIdentityProvider(SAMLParams);
      },
      { wrapper: Wrapper },
    );

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { type, ...input } = SAMLParams;
    expect(mutationOIDCCallSpy).not.toHaveBeenCalled();
    expect(mutationSAMLCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input,
      },
    });
  });
  it('throw error if provider is not SAML or OIDC', async () => {
    const OTHERParams = {
      type: 'OTHER' as const,
    };
    renderHook(
      async () => {
        const { createSSOIdentityProvider } = useCreateSSOIdentityProvider();
        await expect(
          // @ts-expect-error - It's expected to throw an error
          createSSOIdentityProvider(OTHERParams),
        ).rejects.toThrowError();
      },
      { wrapper: Wrapper },
    );
  });
});
