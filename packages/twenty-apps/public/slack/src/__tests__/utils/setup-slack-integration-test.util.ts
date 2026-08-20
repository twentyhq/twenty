import { http, HttpResponse, passthrough } from 'msw';
import { setupServer } from 'msw/node';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { SLACK_TEST_WEBHOOK_SECRET } from 'src/__tests__/constants/slack-test-webhook-secret.constant';
import { type AppRuntimeMock } from 'src/__tests__/types/app-runtime-mock.type';
import { type SlackApiMock } from 'src/__tests__/types/slack-api-mock.type';
import { buildSlackAppConnection } from 'src/__tests__/utils/build-slack-app-connection.util';
import { createAppRuntimeMock } from 'src/__tests__/utils/create-app-runtime-mock.util';
import { createSlackApiMock } from 'src/__tests__/utils/create-slack-api-mock.util';

type SlackIntegrationTestContext = {
  slack: SlackApiMock;
  appRuntime: AppRuntimeMock;
  coreClient: CoreApiClient;
  workspaceId: string;
};

const readWorkspaceIdFromTokenOrThrow = (token: string): string => {
  const payload = ((): { workspaceId?: string } => {
    try {
      return JSON.parse(
        Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
      );
    } catch (error) {
      throw new Error(
        `TWENTY_API_KEY is not a readable JWT: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  })();

  if (payload.workspaceId === undefined) {
    throw new Error('TWENTY_API_KEY carries no workspaceId claim');
  }

  return payload.workspaceId;
};

const localhostPassthroughHandlers = [
  http.all('http://127.0.0.1*', () => passthrough()),
  http.all('http://localhost*', () => passthrough()),
];

// With onUnhandledRequest: 'error', msw throws an uncaught InternalError inside
// the interceptor and the pending request never settles, which hangs the caller
// forever. Responding 500 instead makes the caller fail immediately with an
// attributable error.
const unmockedRequestCatchAllHandler = http.all('*', ({ request }) => {
  const message = `Unmocked external request in integration test: ${request.method} ${request.url}`;

  console.error(message);

  return HttpResponse.json({ error: { message } }, { status: 500 });
});

// Wires the Slack Web API and the app runtime services to in-memory fakes for
// the calling test file. Everything else - the Slack Assistant Request records
// the app reads and writes - goes to the live Twenty server the integration
// suite runs against.
export const setupSlackIntegrationTest = (): SlackIntegrationTestContext => {
  const apiUrl = process.env.TWENTY_API_URL ?? '';
  const apiKey = process.env.TWENTY_API_KEY ?? '';
  const workspaceId = readWorkspaceIdFromTokenOrThrow(apiKey);

  const slack = createSlackApiMock();
  const appRuntime = createAppRuntimeMock({
    apiUrl,
    workspaceId,
    connections: [buildSlackAppConnection(slack.botToken)],
  });

  const mockServer = setupServer(
    ...slack.handlers,
    ...appRuntime.handlers,
    ...localhostPassthroughHandlers,
    unmockedRequestCatchAllHandler,
  );

  beforeAll(() => {
    mockServer.listen({ onUnhandledRequest: 'error' });
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
