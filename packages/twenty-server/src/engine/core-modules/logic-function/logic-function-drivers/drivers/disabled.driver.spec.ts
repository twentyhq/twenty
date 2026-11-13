import { DisabledDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/disabled.driver';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

describe('DisabledDriver', () => {
  it.each(['transpile', 'buildDependencies'] as const)(
    'rejects %s when builds are disabled',
    async (operation) => {
      await expect(
        new DisabledDriver({} as SecureHttpClientService)[operation](),
      ).rejects.toMatchObject({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
      });
    },
  );

  it('still runs HTTP requests, in-process, when logic functions are disabled', async () => {
    const httpClient = jest.fn().mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
    });
    const getHttpClient = jest.fn().mockReturnValue(httpClient);
    const output = await new DisabledDriver({
      getHttpClient,
    } as unknown as SecureHttpClientService).executeHttpRequest({
      input: { url: 'https://api.example.com', method: 'GET' },
      limits: { timeoutMs: 30_000, maxPayloadSizeBytes: 1024 },
      context: { workspaceId: 'workspace-id', source: 'workflow-http' },
    });

    expect(output).toMatchObject({ status: 200, body: { ok: true } });
    expect(getHttpClient).toHaveBeenCalledTimes(1);
    expect(getHttpClient).toHaveBeenCalledWith();
    expect(httpClient).toHaveBeenCalledTimes(1);
    expect(httpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com',
        method: 'GET',
        timeout: 30_000,
        maxContentLength: 1024,
        maxBodyLength: 1024,
      }),
    );
  });
});
