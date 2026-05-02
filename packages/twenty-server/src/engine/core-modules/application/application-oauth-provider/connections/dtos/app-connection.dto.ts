// Wire shape returned to apps from POST /apps/connections/list. Matches the
// SDK's `AppConnection` type. Kept minimal — extend when a real consumer
// needs more fields.
export type AppConnectionDto = {
  id: string;
  scope: 'user' | 'workspace';
  userWorkspaceId: string;
  accessToken: string;
  // Set when the most recent refresh attempt failed; the user must reconnect
  // from the app's settings tab. Apps should surface this to end users.
  authFailedAt: string | null;
};
