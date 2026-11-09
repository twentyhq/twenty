import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { type TestHttpRequestInput } from 'src/engine/core-modules/workflow/dtos/test-http-request.input';
import { WorkflowVersionStepResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-step.resolver';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('WorkflowVersionStepResolver.testHttpRequest', () => {
  it('attributes the test request to the authenticated user', async () => {
    const execute = jest.fn().mockResolvedValue({ success: true });
    const resolver = new WorkflowVersionStepResolver(
      {} as never,
      {} as never,
      { execute } as unknown as HttpTool,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const input = {
      url: 'https://api.example.com/items',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'item' },
    } as TestHttpRequestInput;

    await resolver.testHttpRequest(
      { id: 'workspace-id' } as WorkspaceEntity,
      { id: 'user-id' } as AuthContextUser,
      'user-workspace-id',
      'workspace-member-id',
      input,
    );

    expect(execute).toHaveBeenCalledWith(input, {
      workspaceId: 'workspace-id',
      userId: 'user-id',
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
      outboundRequestSource: 'workflow-http-test',
    });
  });
});
