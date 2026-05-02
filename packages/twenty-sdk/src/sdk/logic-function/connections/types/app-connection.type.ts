// One credential the running app owns. Returned from `listConnections`. The
// server refreshes `accessToken` on read, so the value is always usable at
// the moment the helper resolves.
export type AppConnection = {
  id: string;
  // 'user' = visible only to the user who created it.
  // 'workspace' = visible to every user in the workspace.
  scope: 'user' | 'workspace';
  // The userWorkspace that originally created the credential (also the
  // owner for `scope: 'user'` credentials). Match against
  // `event.userWorkspaceId` to resolve the request user's connection.
  userWorkspaceId: string;
  accessToken: string;
  // Set by the platform when the most recent refresh attempt failed.
  // The user must reconnect from the app's settings tab.
  authFailedAt: string | null;
};
