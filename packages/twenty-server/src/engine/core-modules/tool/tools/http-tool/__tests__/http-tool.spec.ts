import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
    const tokenBucketThrottleOrThrow = jest.fn().mockResolvedValue(undefined);
    const executeHttpRequest = jest
      .fn()
      .mockResolvedValue({ success: true, message: 'from driver' });

    return {
      httpTool: new HttpTool(
        { getHttpClient } as unknown as SecureHttpClientService,
        { tokenBucketThrottleOrThrow } as unknown as ThrottlerService,
        {
          get: (key: string) =>
            ({
              LOGIC_FUNCTION_EXEC_THROTTLE_LIMIT: 1000,
              LOGIC_FUNCTION_EXEC_THROTTLE_TTL: 60_000,
            })[key],
        } as unknown as TwentyConfigService,
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
      tokenBucketThrottleOrThrow,
      executeHttpRequest,
    };
  };

  it('spends a token from the logic function execution bucket', async () => {
    const { httpTool, tokenBucketThrottleOrThrow } = buildHttpTool();

    await httpTool.execute(
      { url: 'https://api.example.com', method: 'GET' },
      { workspaceId: 'workspace-id' },
    );

    expect(tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
      'workspace-id-logic-function-execution',
      1,
      1000,
      60_000,
    );
  });

  it('refuses the request once the workspace bucket is empty', async () => {
    const { httpTool, tokenBucketThrottleOrThrow, httpClient } =
      buildHttpTool();

    tokenBucketThrottleOrThrow.mockRejectedValue(
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
