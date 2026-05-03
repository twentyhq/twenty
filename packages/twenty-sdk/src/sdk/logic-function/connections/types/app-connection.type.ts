// One credential the running app owns. Returned from `listConnections` and
// `getConnection`. The server refreshes `accessToken` on read, so the value
// is always usable at the moment the helper resolves.
//
// Mirrors the server-side `AppConnectionDto`. Anything added on either side
// must be added on the other.
export type AppConnection = {
  id: string;
  // The app-developer-facing provider name (e.g. "linear"). Useful to
  // distinguish credentials when listing across providers without a filter.
  providerName: string;
  // User-given (or auto-derived from the OAuth handle) display label.
  // Falls back to `handle` when the user never set one. Suitable for logs
  // and end-user UI.
  name: string;
  // OAuth-derived identifier (typically email or login). Stays stable
  // across reconnects of the same upstream account.
  handle: string;
  // 'user' = visible only to the user who created it.
  // 'workspace' = visible to every user in the workspace.
  scope: 'user' | 'workspace';
  // The userWorkspace that originally created the credential (also the
  // owner for `scope: 'user'` credentials). Match against
  // `event.userWorkspaceId` to resolve the request user's connection.
  userWorkspaceId: string;
  accessToken: string;
  // OAuth scopes actually granted by the upstream provider on the most
  // recent token issuance (may be a subset of what the app requested).
  scopes: string[];
  // Set when the most recent refresh attempt failed permanently
  // (4xx invalid_grant); the user must reconnect from the app's settings
  // tab. Apps should surface this so users know to take action.
  authFailedAt: string | null;
};
