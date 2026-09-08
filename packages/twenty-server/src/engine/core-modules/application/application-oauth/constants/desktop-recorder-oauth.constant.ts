export const DESKTOP_RECORDER_UNIVERSAL_IDENTIFIER =
  '8bdaaa9f-dc53-4247-a89b-aa386c9b3244';

// Native clients cannot keep a secret. Empty redirect URIs enable Twenty's
// loopback-only redirect validation, with PKCE required for every sign-in.
export const getDesktopRecorderOAuthFields = (universalIdentifier: string) =>
  universalIdentifier === DESKTOP_RECORDER_UNIVERSAL_IDENTIFIER
    ? {
        oAuthClientSecretHash: null,
        oAuthRedirectUris: [] as string[],
        oAuthScopes: ['api', 'profile'],
      }
    : {};
