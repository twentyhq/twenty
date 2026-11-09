import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';

describe('HttpTool', () => {
  const buildHttpTool = () => {
    const httpClient = jest.fn().mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
    });
    const getHttpClient = jest.fn().mockReturnValue(httpClient);

    return {
      httpTool: new HttpTool({
        getHttpClient,
      } as unknown as SecureHttpClientService),
      getHttpClient,
      httpClient,
    };
  };

  it('attributes the outbound request to the caller', async () => {
    const { httpTool, getHttpClient } = buildHttpTool();

    await httpTool.execute(
      { url: 'https://api.example.com', method: 'GET' },
      {
        workspaceId: 'workspace-id',
        userId: 'user-id',
        userWorkspaceId: 'user-workspace-id',
        workspaceMemberId: 'workspace-member-id',
        workflowRunId: 'workflow-run-id',
        workflowStepId: 'workflow-step-id',
        outboundRequestSource: 'workflow-http-test',
      },
    );

    expect(getHttpClient).toHaveBeenCalledWith(undefined, {
      workspaceId: 'workspace-id',
      source: 'workflow-http-test',
      userId: 'user-id',
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
      workflowRunId: 'workflow-run-id',
      workflowStepId: 'workflow-step-id',
    });
  });

  it('falls back to the workflow HTTP source', async () => {
    const { httpTool, getHttpClient } = buildHttpTool();

    await httpTool.execute(
      { url: 'https://api.example.com', method: 'GET' },
      { workspaceId: 'workspace-id' },
    );

    expect(getHttpClient).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ source: 'workflow-http' }),
    );
  });

  it.each([
    ['a non-HTTP URL', { url: 'ftp://example.com/file', method: 'GET' }],
    ['an invalid URL', { url: 'not a url', method: 'GET' }],
    [
      'an unsupported method',
      { url: 'https://api.example.com', method: 'TRACE' },
    ],
    [
      'a non-string header value',
      {
        url: 'https://api.example.com',
        method: 'GET',
        headers: { 'X-Object': { nested: true } },
      },
    ],
  ])('rejects %s without sending the request', async (_label, parameters) => {
    const { httpTool, httpClient } = buildHttpTool();

    const output = await httpTool.execute(parameters, {
      workspaceId: 'workspace-id',
    });

    expect(output).toMatchObject({
      success: false,
      message: 'Invalid arguments for http_request',
    });
    expect(httpClient).not.toHaveBeenCalled();
  });

  it('sends a number header value resolved from a workflow variable as a string', async () => {
    const { httpTool, httpClient } = buildHttpTool();

    const output = await httpTool.execute(
      {
        url: 'https://api.example.com',
        method: 'GET',
        headers: { 'X-Count': 3 },
      },
      { workspaceId: 'workspace-id' },
    );

    expect(output.success).toBe(true);
    expect(httpClient.mock.calls[0][0].headers.get('X-Count')).toBe('3');
  });
});
