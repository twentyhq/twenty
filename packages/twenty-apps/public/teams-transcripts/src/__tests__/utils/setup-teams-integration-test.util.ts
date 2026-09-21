import { http, HttpResponse, passthrough } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { type AppRuntimeMock } from 'src/__tests__/types/app-runtime-mock.type';
import { type GraphApiMock } from 'src/__tests__/types/graph-api-mock.type';
import { buildTeamsAppConnection } from 'src/__tests__/utils/build-teams-app-connection.util';
import { createAppRuntimeMock } from 'src/__tests__/utils/create-app-runtime-mock.util';
import { createGraphApiMock } from 'src/__tests__/utils/create-graph-api-mock.util';

type TeamsIntegrationTestContext = {
  graph: GraphApiMock;
  appRuntime: AppRuntimeMock;
};

const localhostPassthroughHandlers = [
  http.all('http://127.0.0.1*', () => passthrough()),
  http.all('http://localhost*', () => passthrough()),
];

const unmockedRequestCatchAllHandler = http.all('*', ({ request }) => {
  const message = `Unmocked external request in integration test: ${request.method} ${request.url}`;

  console.error(message);

  return HttpResponse.json({ error: { message } }, { status: 500 });
});

export const setupTeamsIntegrationTest = (): TeamsIntegrationTestContext => {
  const apiUrl = process.env.TWENTY_API_URL ?? '';
  const apiKey = process.env.TWENTY_API_KEY ?? '';

  const graph = createGraphApiMock();
  const appRuntime = createAppRuntimeMock({
    apiUrl,
    connections: [buildTeamsAppConnection(graph.accessToken)],
  });

  const mockServer = setupServer(
    ...graph.handlers,
    ...appRuntime.handlers,
    ...localhostPassthroughHandlers,
    unmockedRequestCatchAllHandler,
  );

  beforeAll(() => {
    mockServer.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', apiKey);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    graph.reset();
    appRuntime.reset();
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  return { graph, appRuntime };
};
