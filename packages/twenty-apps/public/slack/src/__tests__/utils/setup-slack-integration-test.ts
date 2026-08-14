import { setupServer } from 'msw/node';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { type AppConnection } from 'twenty-sdk/logic-function';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import {
  createAppRuntimeMock,
  type AppRuntimeMock,
} from 'src/__tests__/utils/create-app-runtime-mock';
import {
  createSlackApiMock,
  type SlackApiMock,
} from 'src/__tests__/utils/create-slack-api-mock';

export const SLACK_TEST_WEBHOOK_SECRET = 'slack-test-signing-secret';
export const SLACK_TEST_CONNECTED_ACCOUNT_ID = 'connected-account-slack-1';

type SlackIntegrationTestContext = {
  slack: SlackApiMock;
  appRuntime: AppRuntimeMock;
  coreClient: CoreApiClient;
  workspaceId: string;
};

const readWorkspaceIdFromToken = (token: string): string => {
  const payload = JSON.parse(
    Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
  ) as { workspaceId?: string };

  if (payload.workspaceId === undefined) {
    throw new Error('TWENTY_API_KEY carries no workspaceId claim');
  }

  return payload.workspaceId;
};

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

// Wires the Slack Web API and the app runtime services to in-memory fakes for
// the calling test file. Everything else - the Slack Assistant Request records
// the app reads and writes - goes to the live Twenty server the integration
// suite runs against.
export const setupSlackIntegrationTest = (): SlackIntegrationTestContext => {
  const apiUrl = process.env.TWENTY_API_URL ?? '';
  const apiKey = process.env.TWENTY_API_KEY ?? '';
  const workspaceId = readWorkspaceIdFromToken(apiKey);

  const slack = createSlackApiMock();
  const appRuntime = createAppRuntimeMock({
    apiUrl,
    workspaceId,
    connections: [buildSlackAppConnection(slack.botToken)],
  });

  const mockServer = setupServer(...slack.handlers, ...appRuntime.handlers);

  beforeAll(() => {
    mockServer.listen({ onUnhandledRequest: 'bypass' });
  });

  beforeEach(() => {
    // Logic functions run with an app access token; the workspace API key is a
    // token with the same workspaceId claim.
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', apiKey);
    vi.stubEnv('SLACK_WEBHOOK_SECRET', SLACK_TEST_WEBHOOK_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    slack.reset();
    appRuntime.reset();
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  return { slack, appRuntime, coreClient: new CoreApiClient(), workspaceId };
};
