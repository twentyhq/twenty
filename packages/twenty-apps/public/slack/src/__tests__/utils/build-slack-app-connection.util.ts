import { type AppConnection } from 'twenty-sdk/logic-function';

import { SLACK_TEST_CONNECTED_ACCOUNT_ID } from 'src/__tests__/constants/slack-test-connected-account-id.constant';

export const buildSlackAppConnection = (
  accessToken: string,
  overrides: Partial<Omit<AppConnection, 'providerType' | 'accessToken'>> = {},
): AppConnection => ({
  id: SLACK_TEST_CONNECTED_ACCOUNT_ID,
  providerName: 'slack',
  name: 'Twenty Test workspace',
  handle: 'twenty-test',
  externalAccountId: null,
  scope: 'WORKSPACE',
  visibility: 'workspace',
  userWorkspaceId: 'user-workspace-1',
  workspaceMemberId: null,
  providerType: 'oauth',
  accessToken,
  scopes: ['chat:write', 'channels:read'],
  authFailedAt: null,
  authFailedReason: null,
  ...overrides,
});
