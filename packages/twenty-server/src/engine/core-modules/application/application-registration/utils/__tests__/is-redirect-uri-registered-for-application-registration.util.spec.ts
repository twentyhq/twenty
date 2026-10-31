import { isRedirectUriRegisteredForApplicationRegistration } from 'src/engine/core-modules/application/application-registration/utils/is-redirect-uri-registered-for-application-registration.util';
import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';

const CHATGPT_UNIVERSAL_IDENTIFIER = WELL_KNOWN_OAUTH_CLIENTS.find(
  ({ client }) => client === WellKnownOAuthClient.CHATGPT,
)?.universalIdentifier as string;

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
      universalIdentifier: CHATGPT_UNIVERSAL_IDENTIFIER,
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
