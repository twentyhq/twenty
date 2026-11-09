import * as http from 'http';
import { type AddressInfo } from 'net';

import { Logger } from '@nestjs/common';

import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type OutboundRequestContext } from 'src/engine/core-modules/secure-http-client/outbound-request-context.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const CONTEXT: OutboundRequestContext = {
  workspaceId: 'workspace-id',
  source: 'workflow-http-test',
  userId: 'user-id',
  workspaceMemberId: 'workspace-member-id',
};

const OUTCOME_PREFIX = 'Outbound HTTP outcome:';

const getClosedPort = async (): Promise<number> => {
  const closedServer = http.createServer();

  await new Promise<void>((resolve) =>
    closedServer.listen(0, '127.0.0.1', resolve),
  );
  const { port } = closedServer.address() as AddressInfo;

  await new Promise((resolve) => closedServer.close(resolve));

  return port;
};

describe('SecureHttpClientService outbound request logging', () => {
  let server: http.Server;
  let port: number;
  let baseUrl: string;
  let service: SecureHttpClientService;
  let counterAdd: jest.Mock;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  const getLoggedMessages = (spy: jest.SpyInstance): string[] =>
    spy.mock.calls.map(([message]) => String(message));

  const getOutcomeLine = (spy: jest.SpyInstance): string | undefined =>
    getLoggedMessages(spy).find((message) =>
      message.startsWith(OUTCOME_PREFIX),
    );

  beforeAll(async () => {
    jest.useRealTimers();

    server = http.createServer((request, response) => {
      switch (request.url?.split('?')[0]) {
        case '/ok':
          response.writeHead(200).end('ok');

          return;
        case '/unavailable':
          response.writeHead(503).end();

          return;
        case '/redirect-to-metadata':
          response
            .writeHead(302, {
              Location: 'http://169.254.169.254/latest/meta-data',
            })
            .end();

          return;
        case '/redirect-to-localhost':
          response
            .writeHead(302, { Location: `http://localhost:${port}/ok` })
            .end();

          return;
        case '/hang':
          return;
        default:
          response.writeHead(404).end();
      }
    });

    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );

    port = (server.address() as AddressInfo).port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    counterAdd = jest.fn();
    logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    service = new SecureHttpClientService(
      {
        get: jest.fn((key: string) =>
          key === 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS'
            ? ['127.0.0.1']
            : undefined,
        ),
      } as unknown as TwentyConfigService,
      {
        getMeter: () => ({ createCounter: () => ({ add: counterAdd }) }),
      } as unknown as MetricsService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs a success with the status, duration and request attribution', async () => {
    await service.getHttpClient(undefined, CONTEXT).get(`${baseUrl}/ok`);

    const outcomeLine = getOutcomeLine(logSpy);

    expect(outcomeLine).toContain('outcome=success');
    expect(outcomeLine).toContain('status=200');
    expect(outcomeLine).toMatch(/durationMs=\d+/);
    expect(outcomeLine).toContain('method=GET');
    expect(outcomeLine).toContain('host=127.0.0.1');
    expect(outcomeLine).toContain('workspace=workspace-id');
    expect(outcomeLine).toContain('source=workflow-http-test');
    expect(outcomeLine).toContain('user=user-id');
    expect(outcomeLine).toContain('workspaceMember=workspace-member-id');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(counterAdd).toHaveBeenCalledWith(1, {
      source: 'workflow-http-test',
      outcome: 'success',
    });
  });

  it('logs an HTTP error status', async () => {
    await expect(
      service.getHttpClient(undefined, CONTEXT).get(`${baseUrl}/unavailable`),
    ).rejects.toThrow();

    const outcomeLine = getOutcomeLine(logSpy);

    expect(outcomeLine).toContain('outcome=http-error');
    expect(outcomeLine).toContain('status=503');
    expect(counterAdd).toHaveBeenCalledWith(1, {
      source: 'workflow-http-test',
      outcome: 'http-error',
    });
  });

  it('logs a timeout', async () => {
    await expect(
      service
        .getHttpClient(undefined, CONTEXT)
        .get(`${baseUrl}/hang`, { timeout: 50 }),
    ).rejects.toThrow();

    const outcomeLine = getOutcomeLine(logSpy);
    const durationMs = Number(outcomeLine?.match(/durationMs=(\d+)/)?.[1]);

    expect(outcomeLine).toContain('outcome=timeout');
    expect(durationMs).toBeGreaterThanOrEqual(40);
    expect(counterAdd).toHaveBeenCalledWith(1, {
      source: 'workflow-http-test',
      outcome: 'timeout',
    });
  });

  it('logs a network error with its code', async () => {
    const closedPort = await getClosedPort();

    await expect(
      service
        .getHttpClient(undefined, CONTEXT)
        .get(`http://127.0.0.1:${closedPort}/`),
    ).rejects.toThrow();

    const outcomeLine = getOutcomeLine(logSpy);

    expect(outcomeLine).toContain('outcome=network-error');
    expect(outcomeLine).toContain('errorCode=ECONNREFUSED');
    expect(counterAdd).toHaveBeenCalledWith(1, {
      source: 'workflow-http-test',
      outcome: 'network-error',
    });
  });

  it('logs each retry attempt separately', async () => {
    const closedPort = await getClosedPort();

    await expect(
      service
        .getHttpClient({ retries: 1 }, CONTEXT)
        .get(`http://127.0.0.1:${closedPort}/`),
    ).rejects.toThrow();

    const messages = getLoggedMessages(logSpy);

    expect(
      messages.filter((message) =>
        message.startsWith('Outbound HTTP request:'),
      ),
    ).toHaveLength(2);
    expect(
      messages.filter((message) => message.startsWith(OUTCOME_PREFIX)),
    ).toHaveLength(2);
    expect(counterAdd).toHaveBeenCalledTimes(2);
  });

  it('warns when the guard blocks an internal IP', async () => {
    await expect(
      service.getHttpClient(undefined, CONTEXT).get('http://10.0.0.1/admin'),
    ).rejects.toThrow(
      'Request to internal IP address 10.0.0.1 is not allowed.',
    );

    const outcomeLine = getOutcomeLine(warnSpy);

    expect(outcomeLine).toContain('outcome=blocked');
    expect(outcomeLine).toContain('host=10.0.0.1');
    expect(outcomeLine).toContain(
      'reason="Request to internal IP address 10.0.0.1 is not allowed."',
    );
    expect(outcomeLine).toContain('user=user-id');
    expect(getOutcomeLine(logSpy)).toBeUndefined();
    expect(counterAdd).toHaveBeenCalledWith(1, {
      source: 'workflow-http-test',
      outcome: 'blocked',
    });
  });

  it('warns when a redirect targets a blocked IP', async () => {
    await expect(
      service
        .getHttpClient(undefined, CONTEXT)
        .get(`${baseUrl}/redirect-to-metadata`),
    ).rejects.toThrow();

    const outcomeLine = getOutcomeLine(warnSpy);

    expect(outcomeLine).toContain('outcome=blocked');
    expect(outcomeLine).toContain('host=127.0.0.1');
    expect(outcomeLine).toContain('169.254.169.254');
  });

  it('warns when a redirect targets a hostname resolving to a blocked IP', async () => {
    await expect(
      service
        .getHttpClient(undefined, CONTEXT)
        .get(`${baseUrl}/redirect-to-localhost`),
    ).rejects.toThrow();

    expect(getOutcomeLine(warnSpy)).toContain('outcome=blocked');
  });

  it('warns when the protocol is not allowed', async () => {
    await expect(
      service.getHttpClient(undefined, CONTEXT).get('ftp://example.com/file'),
    ).rejects.toThrow('Protocol ftp: is not allowed.');

    const outcomeLine = getOutcomeLine(warnSpy);

    expect(outcomeLine).toContain('outcome=blocked');
    expect(outcomeLine).toContain('url=ftp:');
  });

  it('redacts query values and never logs headers or bodies', async () => {
    await service
      .getHttpClient(undefined, CONTEXT)
      .post(
        `http://user:password@127.0.0.1:${port}/ok?api_key=secret-key&page=2#token=secret-fragment`,
        { note: 'secret-body' },
        { headers: { Authorization: 'Bearer secret-token' } },
      );

    const messages = getLoggedMessages(logSpy);
    const expectedUrl = `url=http://127.0.0.1:${port}/ok?api_key=REDACTED&page=REDACTED`;

    expect(messages).toHaveLength(2);

    for (const message of messages) {
      expect(message).toContain(expectedUrl);
      expect(message).not.toMatch(
        /secret-key|secret-fragment|secret-body|secret-token|password/,
      );
    }
  });

  it('does not log or count requests made without a context', async () => {
    await service.getHttpClient().get(`${baseUrl}/ok`);

    await expect(
      service.getHttpClient().get('http://10.0.0.1/'),
    ).rejects.toThrow();

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(counterAdd).not.toHaveBeenCalled();
  });
});
