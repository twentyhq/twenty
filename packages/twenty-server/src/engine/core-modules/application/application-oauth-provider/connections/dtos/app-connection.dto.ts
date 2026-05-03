// Wire shape returned to apps from POST /apps/connections/list and /get.
// Mirrors the SDK's `AppConnection` type. Anything added here must be
// added there too.
export type AppConnectionDto = {
  id: string;
  // The app-developer-facing provider name (lower-case kebab, e.g. "linear"),
  // not the displayName. Matches the `providerName` filter on listConnections.
  providerName: string;
  // User-given (or auto-derived from the OAuth handle) — useful for
  // logging/UI. Falls back to `handle` when the user never set one.
  name: string;
  // OAuth-derived identifier (typically email or login). Stays stable across
  // reconnects of the same upstream account.
  handle: string;
  scope: 'user' | 'workspace';
  // The userWorkspace that originally created the credential.
  userWorkspaceId: string;
  accessToken: string;
  // OAuth scopes actually granted by the upstream provider on the most
  // recent token issuance (may be a subset of what the app requested).
  scopes: string[];
  // Set when the most recent refresh attempt failed permanently
  // (4xx invalid_grant); the user must reconnect from the app settings tab.
  // Apps should surface this in their UI so users know to reconnect.
  authFailedAt: string | null;
};
