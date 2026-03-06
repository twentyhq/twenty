// Scopes are a thin consent boundary shown to the user during OAuth authorization.
// Actual permissions are enforced by the role assigned to the application at the
// workspace level (object, field, and row-level permissions).
export const OAUTH_SCOPES = {
  API: 'api',
  PROFILE: 'profile',
} as const;

export type OAuthScope = (typeof OAUTH_SCOPES)[keyof typeof OAUTH_SCOPES];

export const ALL_OAUTH_SCOPES: OAuthScope[] = Object.values(OAUTH_SCOPES);

export const OAUTH_SCOPE_DESCRIPTIONS: Record<OAuthScope, string> = {
  [OAUTH_SCOPES.API]: 'Access workspace data according to the assigned role',
  [OAUTH_SCOPES.PROFILE]: "Read the authenticated user's profile",
};
