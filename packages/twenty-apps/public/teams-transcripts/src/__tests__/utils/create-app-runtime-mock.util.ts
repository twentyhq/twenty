import { http, HttpResponse, passthrough, type RequestHandler } from 'msw';
import { type AppConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type AppRuntimeMock } from 'src/__tests__/types/app-runtime-mock.type';

const readOperationName = (query: string): string | undefined =>
  query.match(/(?:query|mutation)\s+(\w+)/)?.[1];

type ListAppConnectionsRequestBody = {
  query?: string;
  variables?: { filter?: { providerName?: string } };
};

export const createAppRuntimeMock = ({
  apiUrl,
  connections,
}: {
  apiUrl: string;
  connections: AppConnection[];
}): AppRuntimeMock => {
  const state = { connections };

  const handlers: RequestHandler[] = [
    http.post<never, ListAppConnectionsRequestBody>(
      `${apiUrl}/metadata`,
      async ({ request }) => {
        const body: ListAppConnectionsRequestBody = await request
          .clone()
          .json();

        if (readOperationName(body.query ?? '') !== 'ListAppConnections') {
          return passthrough();
        }

        const providerName = body.variables?.filter?.providerName;

        return HttpResponse.json({
          data: {
            appConnections: state.connections.filter(
              (connection) =>
                !isDefined(providerName) ||
                connection.providerName === providerName,
            ),
          },
        });
      },
    ),
  ];

  return {
    handlers,
    setConnections: (nextConnections: AppConnection[]): void => {
      state.connections = nextConnections;
    },
    reset: (): void => {
      state.connections = connections;
    },
  };
};
