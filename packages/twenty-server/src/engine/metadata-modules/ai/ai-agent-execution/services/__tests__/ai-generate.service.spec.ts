import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { RunAgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/enums/run-agent-message-role.enum';
import { AiGenerateService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/ai-generate.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

describe('AiGenerateService generate', () => {
  // the AI permission guard lets an OAuth-only application without a role act with its member's role
  it('refuses an OAuth-only application without a default role before running anything', async () => {
    const agentRunCallerContextService = { buildExecutionContext: jest.fn() };
    const agentRunnerService = { runInRequest: jest.fn() };
    const service = new AiGenerateService(
      agentRunCallerContextService as never,
      agentRunnerService as never,
    );

    const generation = service.generate({
      workspace: { id: 'workspace-id' } as FlatWorkspace,
      requestUserWorkspaceId: 'user-workspace-id',
      requestWorkspaceMemberId: 'workspace-member-id',
      callerApplication: {
        id: 'application-id',
        defaultRoleId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      } as FlatApplication,
      input: {
        input: [{ role: RunAgentMessageRole.user, content: 'Qualify Acme' }],
      },
    });

    await expect(generation).rejects.toBeInstanceOf(AiException);
    await expect(generation).rejects.toMatchObject({
      code: AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
    });
    expect(
      agentRunCallerContextService.buildExecutionContext,
    ).not.toHaveBeenCalled();
    expect(agentRunnerService.runInRequest).not.toHaveBeenCalled();
  });
});
