import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';

describe('HttpTool', () => {
  const buildHttpTool = () => {
    const getHttpClient = jest.fn().mockReturnValue(
      jest.fn().mockResolvedValue({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      }),
    );

    return {
      httpTool: new HttpTool({
        getHttpClient,
      } as unknown as SecureHttpClientService),
      getHttpClient,
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
});
