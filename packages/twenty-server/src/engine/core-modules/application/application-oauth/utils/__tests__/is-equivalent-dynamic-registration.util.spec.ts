import { isEquivalentDynamicRegistration } from 'src/engine/core-modules/application/application-oauth/utils/is-equivalent-dynamic-registration.util';

const registration = {
  oAuthClientId: 'b5a3c9a4-8f0e-4c1e-9d3a-1f2b3c4d5e6f',
  oAuthRedirectUris: ['http://127.0.0.1:4000/callback'],
  oAuthScopes: ['api', 'profile'],
};

describe('isEquivalentDynamicRegistration', () => {
  it('reuses a registration when only the loopback port and scope order differ', () => {
    expect(
      isEquivalentDynamicRegistration(registration, {
        redirectUris: ['http://127.0.0.1:61000/callback'],
        scopes: ['profile', 'api'],
      }),
    ).toBe(true);
  });

  it.each([
    {
      redirectUris: ['https://attacker.example.com/callback'],
      scopes: ['api', 'profile'],
    },
    {
      redirectUris: [
        'http://127.0.0.1:4000/callback',
        'https://attacker.example.com/callback',
      ],
      scopes: ['api', 'profile'],
    },
    { redirectUris: ['http://127.0.0.1:4000/callback'], scopes: ['api'] },
  ])('does not reuse it for a different request %#', (request) => {
    expect(isEquivalentDynamicRegistration(registration, request)).toBe(false);
  });

  it('never reuses a client ID metadata document registration', () => {
    expect(
      isEquivalentDynamicRegistration(
        { ...registration, oAuthClientId: 'https://client.example.com/oauth' },
        {
          redirectUris: registration.oAuthRedirectUris,
          scopes: registration.oAuthScopes,
        },
      ),
    ).toBe(false);
  });
});
