import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

import { isRedirectUriRegisteredForApplicationRegistration } from 'src/engine/core-modules/application/application-registration/utils/is-redirect-uri-registered-for-application-registration.util';

describe('isRedirectUriRegisteredForApplicationRegistration', () => {
  it('matches the stored callbacks of a regular registration exactly', () => {
    const applicationRegistration = {
      universalIdentifier: '7f6f5a4e-0000-4000-8000-000000000001',
      oAuthRedirectUris: ['https://example.com/callback'],
    };

    expect(
      isRedirectUriRegisteredForApplicationRegistration({
        applicationRegistration,
        redirectUri: 'https://example.com/callback',
      }),
    ).toBe(true);
    expect(
      isRedirectUriRegisteredForApplicationRegistration({
        applicationRegistration,
        redirectUri: 'https://example.com/callback/other',
      }),
    ).toBe(false);
  });

  it('lets a seeded well-known registration use every callback its vendor documents', () => {
    const applicationRegistration = {
      universalIdentifier:
        WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CHATGPT,
      oAuthRedirectUris: [
        'https://chatgpt.com/connector_platform_oauth_redirect',
      ],
    };

    expect(
      isRedirectUriRegisteredForApplicationRegistration({
        applicationRegistration,
        redirectUri: 'https://chatgpt.com/connector/oauth/abc123',
      }),
    ).toBe(true);
    expect(
      isRedirectUriRegisteredForApplicationRegistration({
        applicationRegistration,
        redirectUri: 'https://example.com/callback',
      }),
    ).toBe(false);
  });
});
