import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export const DESKTOP_RECORDER_UNIVERSAL_IDENTIFIER =
  '8bdaaa9f-dc53-4247-a89b-aa386c9b3244';

export const DESKTOP_RECORDER_CATALOG_REQUIRED_MESSAGE =
  'Desktop Recorder must be installed from its official catalog package';

type DesktopRecorderOAuthFields = Pick<
  ApplicationRegistrationEntity,
  'oAuthClientSecretHash' | 'oAuthRedirectUris' | 'oAuthScopes'
>;

// Native clients cannot keep a secret. Empty redirect URIs enable Twenty's
// loopback-only redirect validation, with PKCE required for every sign-in.
export const DESKTOP_RECORDER_OAUTH_FIELDS: DesktopRecorderOAuthFields = {
  oAuthClientSecretHash: null,
  oAuthRedirectUris: [],
  oAuthScopes: ['api', 'profile'],
};

export const getDesktopRecorderOAuthFields = (
  universalIdentifier: string,
): Partial<DesktopRecorderOAuthFields> =>
  universalIdentifier === DESKTOP_RECORDER_UNIVERSAL_IDENTIFIER
    ? DESKTOP_RECORDER_OAUTH_FIELDS
    : {};

export const DESKTOP_RECORDER_PACKAGE = '@twentyhq/companion-app';
