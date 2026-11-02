import { type Manifest } from 'twenty-shared/application';

import { getApplicationOAuthIdentity } from 'src/engine/core-modules/application/application-oauth-identity/utils/get-application-oauth-identity.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

const OAUTH_IDENTITY = {
  redirectUris: ['https://claude.ai/api/mcp/auth_callback'],
  connectUrl: 'https://claude.ai/customize/connectors',
};

const buildRegistration = ({
  sourceType = ApplicationRegistrationSourceType.NPM,
  sourcePackage = '@twentyhq/claude',
  oAuthIdentity = OAUTH_IDENTITY,
}: {
  sourceType?: ApplicationRegistrationSourceType;
  sourcePackage?: string | null;
  oAuthIdentity?: typeof OAUTH_IDENTITY;
} = {}) => ({
  sourceType,
  sourcePackage,
  manifest: { application: { oAuthIdentity } } as Manifest,
});

describe('getApplicationOAuthIdentity', () => {
  it('trusts the OAuth identity of an app Twenty publishes', () => {
    expect(getApplicationOAuthIdentity(buildRegistration())).toEqual(
      OAUTH_IDENTITY,
    );
  });

  it.each([
    ['another publisher', buildRegistration({ sourcePackage: 'claude-app' })],
    [
      'a tarball',
      buildRegistration({
        sourceType: ApplicationRegistrationSourceType.TARBALL,
      }),
    ],
    [
      'a local app',
      buildRegistration({
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
    ],
    [
      'an invalid identity',
      buildRegistration({
        oAuthIdentity: {
          ...OAUTH_IDENTITY,
          redirectUris: ['http://claude.ai/api/mcp/auth_callback'],
        },
      }),
    ],
  ])('ignores the OAuth identity of %s', (_description, registration) => {
    expect(getApplicationOAuthIdentity(registration)).toBeNull();
  });

  it('finds nothing without a manifest', () => {
    expect(
      getApplicationOAuthIdentity({
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: '@twentyhq/claude',
        manifest: null,
      }),
    ).toBeNull();
    expect(getApplicationOAuthIdentity(undefined)).toBeNull();
  });
});
