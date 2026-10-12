import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';

import { getListeningPort } from '@/utils/get-listening-port';

export type RecordedRequest = {
  method: string;
  path: string;
  headers: IncomingMessage['headers'];
  body: string;
};

type TestServerHandler = (
  request: RecordedRequest,
  response: ServerResponse,
) => void;

export const startTestServer = async (handler: TestServerHandler) => {
  const requests: RecordedRequest[] = [];
  const server = createServer((incomingMessage, response) => {
    let body = '';

    incomingMessage.on('data', (chunk) => {
      body += String(chunk);
    });
    incomingMessage.on('end', () => {
      const request = {
        method: incomingMessage.method ?? '',
        path: incomingMessage.url ?? '',
        headers: incomingMessage.headers,
        body,
      };

      requests.push(request);
      handler(request, response);
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const port = getListeningPort(server);

  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
};

export const sendJson = (
  response: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) => {
  response.writeHead(status, {
    'content-type': 'application/json',
    ...headers,
  });
  response.end(JSON.stringify(body));
};
