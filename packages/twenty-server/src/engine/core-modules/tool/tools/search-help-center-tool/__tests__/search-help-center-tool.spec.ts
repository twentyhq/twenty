import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { SearchHelpCenterTool } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const setup = ({ post }: { post: jest.Mock }) => {
  const getHttpClient = jest.fn().mockReturnValue({ post });

  const tool = new SearchHelpCenterTool(
    {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as TwentyConfigService,
    { getHttpClient } as unknown as SecureHttpClientService,
  );

  return { tool, getHttpClient };
};

const execute = (tool: SearchHelpCenterTool) =>
  tool.execute({ query: 'how to import data' }, {} as ToolExecutionContext);

describe('SearchHelpCenterTool', () => {
  it('bounds the request and retries transient transport failures', async () => {
    // The shared fallback endpoint resets connections under load, so an
    // unbounded, non-retrying request leaves the agent waiting on it.
    const { tool, getHttpClient } = setup({
      post: jest.fn().mockResolvedValue({ data: [] }),
    });

    await execute(tool);

    expect(getHttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: expect.any(Number),
        retries: expect.any(Number),
      }),
    );

    const { timeout, retries } = getHttpClient.mock.calls[0][0];

    expect(timeout).toBeGreaterThan(0);
    expect(retries).toBeGreaterThan(0);
  });

  it("surfaces the endpoint's reason and status when it rate-limits", async () => {
    const { tool } = setup({
      post: jest.fn().mockRejectedValue(
        new AxiosError(
          'Request failed with status code 429',
          undefined,
          undefined,
          undefined,
          {
            status: 429,
            data: { error: 'Rate limit exceeded. Please try again later' },
            statusText: '',
            headers: new AxiosHeaders(),
            config: { headers: new AxiosHeaders() },
          } as AxiosResponse,
        ),
      ),
    });

    const result = await execute(tool);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'Rate limit exceeded. Please try again later (HTTP 429)',
    );
  });

  it('reports a connection reset instead of swallowing it', async () => {
    const { tool } = setup({
      post: jest
        .fn()
        .mockRejectedValue(new AxiosError('read ECONNRESET', 'ECONNRESET')),
    });

    const result = await execute(tool);

    expect(result.success).toBe(false);
    expect(result.error).toBe('read ECONNRESET');
  });

  it('does not report "undefined" articles when the payload is not an array', async () => {
    const { tool } = setup({
      post: jest
        .fn()
        .mockResolvedValue({ data: { results: [{ title: 'A' }] } }),
    });

    const result = await execute(tool);

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Found 1 relevant help center article for "how to import data"',
    );
    expect(result.result).toEqual([{ title: 'A' }]);
  });

  it('reports an empty answer as a successful search that found nothing', async () => {
    const { tool } = setup({
      post: jest.fn().mockResolvedValue({ data: [] }),
    });

    const result = await execute(tool);

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'No help center articles found for "how to import data"',
    );
    expect(result.result).toEqual([]);
  });

  it('fails loudly on an unrecognized success payload instead of reporting no articles', async () => {
    // A 200 carrying an error body must not reach the agent as a successful
    // search with nothing found -- that hides the operational failure.
    const { tool } = setup({
      post: jest
        .fn()
        .mockResolvedValue({ data: { error: 'Rate limit exceeded' } }),
    });

    const result = await execute(tool);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'Help center search returned a response in an unrecognized shape',
    );
  });
});
