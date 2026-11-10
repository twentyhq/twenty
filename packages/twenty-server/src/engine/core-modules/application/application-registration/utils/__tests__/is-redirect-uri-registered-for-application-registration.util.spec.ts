import { type Manifest } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isRedirectUriRegisteredForApplicationRegistration } from 'src/engine/core-modules/application/application-registration/utils/is-redirect-uri-registered-for-application-registration.util';

const CHATGPT_MANIFEST = {
  application: {
    oAuthIdentity: {
      redirectUris: [
        'https://chatgpt.com/connector_platform_oauth_redirect',
        'https://chatgpt.com/connector/oauth/*',
      ],
      connectUrl: 'https://chatgpt.com/apps/twenty',
    },
  },
} as Manifest;

describe('isRedirectUriRegisteredForApplicationRegistration', () => {
  it('matches the stored callbacks of a regular registration exactly', () => {
    const applicationRegistration = {
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      sourcePackage: null,
      manifest: null,
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

  it('lets an app with an OAuth identity use every callback the identity declares', () => {
    const applicationRegistration = {
      sourceType: ApplicationRegistrationSourceType.NPM,
      sourcePackage: '@twentyhq/chatgpt',
      manifest: CHATGPT_MANIFEST,
      oAuthRedirectUris: [],
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

  it('ignores an OAuth identity declared by a package Twenty does not publish', () => {
    expect(
      isRedirectUriRegisteredForApplicationRegistration({
        applicationRegistration: {
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: 'chatgpt-for-twenty',
          manifest: CHATGPT_MANIFEST,
          oAuthRedirectUris: [],
        },
        redirectUri: 'https://chatgpt.com/connector/oauth/abc123',
      }),
    ).toBe(false);
  });
});
