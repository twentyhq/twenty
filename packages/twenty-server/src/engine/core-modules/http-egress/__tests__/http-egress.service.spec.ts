import { Logger } from '@nestjs/common';

import { HttpEgressService } from 'src/engine/core-modules/http-egress/http-egress.service';
import { type HttpEgressAdmissionService } from 'src/engine/core-modules/http-egress/services/http-egress-admission.service';
import { type HttpEgressAdmission } from 'src/engine/core-modules/http-egress/types/http-egress-admission.type';
import { executeHttpEgressRequest } from 'src/engine/core-modules/http-egress/utils/execute-http-egress-request.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';

jest.mock(
  'src/engine/core-modules/http-egress/utils/execute-http-egress-request.util',
);

const mockedExecuteHttpEgressRequest = jest.mocked(executeHttpEgressRequest);

const VALID_INPUT = {
  url: 'https://api.example.com/items?token=secret',
  method: 'GET',
};

const TEST_CONTEXT: ToolExecutionContext = {
  workspaceId: 'workspace-1',
  userId: 'user-1',
  userWorkspaceId: 'user-workspace-1',
  outboundRequestSource: 'workflow-http-test',
};

describe('HttpEgressService', () => {
  let service: HttpEgressService;
  let admission: HttpEgressAdmission;
  let admissionService: { admit: jest.Mock; recordBlockedRequest: jest.Mock };
  let metricsService: { incrementCounterForEvent: jest.Mock };
  let secureHttpClientService: { getHttpClient: jest.Mock };
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  const getLoggedEntry = (spy: jest.SpyInstance) =>
    JSON.parse(spy.mock.calls[0][0].replace('HTTP egress ', ''));

  beforeEach(() => {
    jest.clearAllMocks();

    admission = { rejection: null, isEnforced: true };
    admissionService = {
      admit: jest.fn().mockImplementation(async () => admission),
      recordBlockedRequest: jest.fn(),
    };
    metricsService = { incrementCounterForEvent: jest.fn() };
    secureHttpClientService = { getHttpClient: jest.fn().mockReturnValue({}) };
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    mockedExecuteHttpEgressRequest.mockResolvedValue({
      toolOutput: { success: true, message: 'ok', status: 200 },
      diagnostics: {
        outcome: 'success',
        status: 200,
        resolvedAddress: '93.184.216.34',
        durationMs: 12,
      },
    });

    service = new HttpEgressService(
      secureHttpClientService as unknown as SecureHttpClientService,
      admissionService as unknown as HttpEgressAdmissionService,
      metricsService as unknown as MetricsService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should run an admitted request with the in-process limits', async () => {
    const output = await service.execute(VALID_INPUT, TEST_CONTEXT);

    expect(output).toEqual({ success: true, message: 'ok', status: 200 });
    expect(mockedExecuteHttpEgressRequest).toHaveBeenCalledWith(
      {
        input: VALID_INPUT,
        limits: { timeoutMs: 30_000, maxPayloadSizeBytes: 10 * 1024 * 1024 },
      },
      expect.anything(),
    );
    expect(secureHttpClientService.getHttpClient).toHaveBeenCalledWith();
  });

  it('should admit with the caller identity and source', async () => {
    await service.execute(VALID_INPUT, TEST_CONTEXT);

    expect(admissionService.admit).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      userWorkspaceId: 'user-workspace-1',
      source: 'workflow-http-test',
    });
  });

  it('should treat a call without source as the AI agent tool', async () => {
    await service.execute(VALID_INPUT, { workspaceId: 'workspace-1' });

    expect(admissionService.admit).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'agent-http-tool' }),
    );
  });

  it('should log one line per request without the path or query string', async () => {
    await service.execute(VALID_INPUT, {
      ...TEST_CONTEXT,
      workflowRunId: 'run-1',
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).not.toContain('secret');
    expect(getLoggedEntry(logSpy)).toMatchObject({
      source: 'workflow-http-test',
      workspaceId: 'workspace-1',
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
      workflowRunId: 'run-1',
      method: 'GET',
      host: 'api.example.com',
      port: '443',
      outcome: 'success',
      status: 200,
      resolvedAddress: '93.184.216.34',
    });
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith({
      key: MetricsKeys.HttpEgressRequest,
      attributes: { source: 'workflow-http-test', outcome: 'success' },
      shouldStoreInCache: false,
    });
  });

  it('should reject an invalid request before admission', async () => {
    const output = await service.execute(
      { url: 'ftp://example.com', method: 'GET' },
      TEST_CONTEXT,
    );

    expect(output).toMatchObject({
      success: false,
      message: 'Invalid arguments for http_request',
    });
    expect(admissionService.admit).not.toHaveBeenCalled();
    expect(getLoggedEntry(warnSpy)).toMatchObject({
      outcome: 'invalid_request',
    });
  });

  it('should accept number header values from resolved workflow variables', async () => {
    await service.execute(
      { ...VALID_INPUT, headers: { 'X-Count': 3 } },
      TEST_CONTEXT,
    );

    expect(mockedExecuteHttpEgressRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ headers: { 'X-Count': '3' } }),
      }),
      expect.anything(),
    );
  });

  it('should refuse an enforced rate limit rejection without sending the request', async () => {
    admission = {
      rejection: { reason: 'test-user-rate', retryAfterMs: 41_200 },
      isEnforced: true,
    };

    const output = await service.execute(VALID_INPUT, TEST_CONTEXT);

    expect(output).toEqual({
      success: false,
      message: `HTTP GET request to ${VALID_INPUT.url} failed`,
      error:
        'HTTP request limit reached (test requests per user). Try again in 42s.',
    });
    expect(mockedExecuteHttpEgressRequest).not.toHaveBeenCalled();
    expect(getLoggedEntry(warnSpy)).toMatchObject({
      outcome: 'rate_limited',
      rejectedBy: 'test-user-rate',
    });
  });

  it('should refuse a suspended workspace', async () => {
    admission = {
      rejection: { reason: 'suspended' },
      isEnforced: true,
    };

    const output = await service.execute(VALID_INPUT, TEST_CONTEXT);

    expect(output.error).toContain('paused for this workspace');
    expect(getLoggedEntry(warnSpy)).toMatchObject({ outcome: 'suspended' });
  });

  it('should send the request and log the rejection when limits are not enforced', async () => {
    admission = {
      rejection: { reason: 'workspace-rate', retryAfterMs: 1_000 },
      isEnforced: false,
    };

    await service.execute(VALID_INPUT, {
      workspaceId: 'workspace-1',
      outboundRequestSource: 'workflow-http',
    });

    expect(mockedExecuteHttpEgressRequest).toHaveBeenCalled();
    expect(getLoggedEntry(logSpy)).toMatchObject({
      outcome: 'success',
      wouldBeRejectedBy: 'workspace-rate',
    });
  });

  it('should count requests blocked by the SSRF guard toward suspension', async () => {
    mockedExecuteHttpEgressRequest.mockResolvedValue({
      toolOutput: { success: false, message: 'failed', error: 'blocked' },
      diagnostics: {
        outcome: 'blocked',
        resolvedAddress: '169.254.169.254',
        durationMs: 3,
      },
    });

    await service.execute(VALID_INPUT, TEST_CONTEXT);

    expect(admissionService.recordBlockedRequest).toHaveBeenCalledWith(
      'workspace-1',
    );
    expect(getLoggedEntry(warnSpy)).toMatchObject({
      outcome: 'blocked',
      resolvedAddress: '169.254.169.254',
    });
  });
});
