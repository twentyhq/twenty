import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { type LogicFunctionExecutionThrottleService } from 'src/engine/core-modules/logic-function/logic-function-execution-throttle/logic-function-execution-throttle.service';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';

describe('HttpTool', () => {
  const buildHttpTool = ({
    isLogicFunctionRuntimeEnabled = false,
  }: { isLogicFunctionRuntimeEnabled?: boolean } = {}) => {
    const httpClient = jest.fn().mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
    });
    const getHttpClient = jest.fn().mockReturnValue(httpClient);
    const throttleOrThrow = jest.fn().mockResolvedValue(undefined);
    const executeHttpRequest = jest.fn().mockResolvedValue({
      toolOutput: { success: true, message: 'from driver' },
      outcomeDetails: { outcome: 'success', status: 200, durationMs: 1 },
    });

    return {
      httpTool: new HttpTool(
        {
          getHttpClient,
          recordRequest: jest.fn(),
          recordRequestOutcome: jest.fn(),
        } as unknown as SecureHttpClientService,
        { throttleOrThrow } as unknown as LogicFunctionExecutionThrottleService,
        {
          isFeatureEnabled: jest
            .fn()
            .mockResolvedValue(isLogicFunctionRuntimeEnabled),
        } as unknown as FeatureFlagService,
        {
          getCurrentDriver: () => ({ executeHttpRequest }),
        } as unknown as LogicFunctionDriverFactory,
      ),
      getHttpClient,
      httpClient,
      throttleOrThrow,
      executeHttpRequest,
    };
  };

  it('spends a token from the logic function execution bucket', async () => {
    const { httpTool, throttleOrThrow } = buildHttpTool();

    await httpTool.execute(
      { url: 'https://api.example.com', method: 'GET' },
      { workspaceId: 'workspace-id' },
    );

    expect(throttleOrThrow).toHaveBeenCalledWith('workspace-id');
  });

  it('refuses the request once the workspace bucket is empty', async () => {
    const { httpTool, throttleOrThrow, httpClient } = buildHttpTool();

    throttleOrThrow.mockRejectedValue(
      new ThrottlerException(
        'Limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    const output = await httpTool.execute(
      { url: 'https://api.example.com', method: 'GET' },
      { workspaceId: 'workspace-id' },
    );

    expect(output).toMatchObject({
      success: false,
      error:
        'Too many HTTP requests and logic function runs for this workspace. Try again shortly.',
    });
    expect(httpClient).not.toHaveBeenCalled();
  });

  it('runs the request through the logic function driver when the flag is on', async () => {
    const { httpTool, executeHttpRequest, getHttpClient } = buildHttpTool({
      isLogicFunctionRuntimeEnabled: true,
    });

    const output = await httpTool.execute(
      { url: 'https://api.example.com', method: 'GET' },
      { workspaceId: 'workspace-id', outboundRequestSource: 'ai-http-tool' },
    );

    expect(output).toEqual({ success: true, message: 'from driver' });
    expect(executeHttpRequest).toHaveBeenCalledWith({
      input: { url: 'https://api.example.com', method: 'GET' },
      limits: { timeoutMs: 30_000, maxPayloadSizeBytes: 10 * 1024 * 1024 },
      context: { workspaceId: 'workspace-id', source: 'ai-http-tool' },
    });
    expect(getHttpClient).not.toHaveBeenCalled();
  });
});
