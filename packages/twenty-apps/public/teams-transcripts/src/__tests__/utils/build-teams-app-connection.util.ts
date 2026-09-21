import { type AppConnection } from 'twenty-sdk/logic-function';

import { TEAMS_TEST_CONNECTED_ACCOUNT_ID } from 'src/__tests__/constants/teams-test-connected-account-id.constant';
import { TEAMS_TEST_USER_WORKSPACE_ID } from 'src/__tests__/constants/teams-test-user-workspace-id.constant';
import { TEAMS_PROVIDER_NAME } from 'src/constants/teams.constant';

export const buildTeamsAppConnection = (
  accessToken: string,
  overrides: Partial<AppConnection> = {},
): AppConnection => ({
  id: TEAMS_TEST_CONNECTED_ACCOUNT_ID,
  providerName: TEAMS_PROVIDER_NAME,
  name: 'Organizer',
  handle: 'organizer@example.com',
  visibility: 'user',
  userWorkspaceId: TEAMS_TEST_USER_WORKSPACE_ID,
  workspaceMemberId: null,
  accessToken,
  scopes: ['https://graph.microsoft.com/OnlineMeetingTranscript.Read.All'],
  authFailedAt: null,
  authFailedReason: null,
  ...overrides,
});
