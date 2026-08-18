import { type AppConnection } from 'twenty-sdk/logic-function';

import { SLACK_TEST_CONNECTED_ACCOUNT_ID } from 'src/__tests__/constants/slack-test-connected-account-id.constant';

export const buildSlackAppConnection = (
  accessToken: string,
  overrides: Partial<AppConnection> = {},
): AppConnection => ({
  id: SLACK_TEST_CONNECTED_ACCOUNT_ID,
  providerName: 'slack',
  name: 'Twenty Test workspace',
  handle: 'twenty-test',
  visibility: 'workspace',
  userWorkspaceId: 'user-workspace-1',
  accessToken,
  scopes: ['chat:write', 'channels:read'],
  authFailedAt: null,
  ...overrides,
});
