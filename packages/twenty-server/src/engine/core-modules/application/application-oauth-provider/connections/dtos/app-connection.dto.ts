// Wire shape returned to apps from POST /apps/connections/list and /get.
// Matches the SDK's `AppConnection` type.
export type AppConnectionDto = {
  id: string;
  name: string | null;
  scope: 'user' | 'workspace';
  providerName: string;
  userWorkspaceId: string;
  accessToken: string;
  scopes: string[];
  handle: string | null;
  lastRefreshedAt: string | null;
  authFailedAt: string | null;
};
