import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';

import { type AgentRunWithoutConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-without-conversation.service';
import { AiGenerateService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/ai-generate.service';
import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';

type RunOneShotInput = Parameters<
  AgentRunWithoutConversationService['runOneShot']
>[0];

const WORKSPACE = {
  id: 'workspace-id',
  workspaceCustomApplicationId: 'custom-application-id',
} as never;

const APPLICATION = {
  id: 'application-id',
  universalIdentifier: 'application-uid',
  defaultRoleId: 'application-role-id',
} as never;

const MESSAGES = [{ role: 'user' as const, content: 'Is Acme a good fit?' }];

const buildService = ({
  outcome = { status: 'COMPLETED', result: { response: 'Yes.' } },
}: { outcome?: object } = {}) => {
  const agentActorContextService = {
    buildRunAsWorkspaceMemberContext: jest.fn().mockResolvedValue({
      authContext: { type: 'user', workspaceMemberId: 'member-id' },
      actorContext: { source: 'MANUAL', name: 'Ada' },
      roleId: 'member-role-id',
    }),
  };
  // runs the context build the real service runs, so a setup failure surfaces as it would
  const agentRunWithoutConversationService = {
    runOneShot: jest.fn(async ({ buildExecutionContext }: RunOneShotInput) => {
      try {
        await buildExecutionContext();
      } catch (error) {
        return {
          turnId: null,
          outcome: { status: 'FAILED', error: (error as Error).message },
          summary: null,
        };
      }

      return {
        turnId: 'turn-id',
        outcome,
        summary: { usage: { inputTokens: 12, outputTokens: 7 } },
      };
    }),
  };
  const apiKeyRoleService = {
    getRoleIdForApiKeyId: jest.fn().mockResolvedValue('api-key-role-id'),
  };

  const service = new AiGenerateService(
    agentActorContextService as never,
    agentRunWithoutConversationService as never,
    apiKeyRoleService as never,
  );

  return { service, agentRunWithoutConversationService };
};

describe('AiGenerateService', () => {
  it('runs one turn as the calling member, through the calling application', async () => {
    const { service, agentRunWithoutConversationService } = buildService();

    const result = await service.generate({
      workspace: WORKSPACE,
      requestUserWorkspaceId: 'user-workspace-id',
      requestWorkspaceMemberId: 'member-id',
      callerApplication: APPLICATION,
      input: { input: MESSAGES, instructions: 'Qualify leads.' },
    });

    expect(result).toEqual({
      success: true,
      text: 'Yes.',
      object: null,
      error: null,
      turnId: 'turn-id',
      usage: { inputTokens: 12, outputTokens: 7 },
    });

    const { buildExecutionContext, spec } =
      agentRunWithoutConversationService.runOneShot.mock.calls[0][0];
    const executionContext = await buildExecutionContext();

    expect(executionContext.agentRunRoleIds).toEqual({
      userWorkspaceRoleId: 'member-role-id',
      applicationRoleId: 'application-role-id',
    });
    expect(spec).toMatchObject({
      agentId: null,
      inlineConfig: {
        instructions: 'Qualify leads.',
        modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
        scope: null,
        applicationId: 'application-id',
      },
      capabilities: { canAskHumans: false },
    });
  });

  it('acts as the application alone when no member calls', async () => {
    const { service, agentRunWithoutConversationService } = buildService();

    await service.generate({
      workspace: WORKSPACE,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApplication: APPLICATION,
      input: { input: MESSAGES },
    });

    const executionContext =
      await agentRunWithoutConversationService.runOneShot.mock.calls[0][0].buildExecutionContext();

    expect(executionContext.authContext.type).toBe('application');
    expect(executionContext.agentRunRoleIds).toEqual({
      applicationRoleId: 'application-role-id',
    });
  });

  it('acts as an API key with its role', async () => {
    const { service, agentRunWithoutConversationService } = buildService();

    await service.generate({
      workspace: WORKSPACE,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApiKey: { id: 'api-key-id' } as never,
      input: { input: MESSAGES },
    });

    const executionContext =
      await agentRunWithoutConversationService.runOneShot.mock.calls[0][0].buildExecutionContext();

    expect(executionContext.agentRunRoleIds).toEqual({
      apiKeyRoleId: 'api-key-role-id',
    });
  });

  it('returns the structured result of a json response format', async () => {
    const { service } = buildService({
      outcome: { status: 'COMPLETED', result: { fit: true } },
    });

    const result = await service.generate({
      workspace: WORKSPACE,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApplication: APPLICATION,
      input: {
        input: MESSAGES,
        responseFormat: {
          type: 'json',
          schema: {
            type: 'object',
            properties: { fit: { type: 'boolean' } },
          },
        },
      },
    });

    expect(result).toMatchObject({ text: null, object: { fit: true } });
  });

  it('passes a valid scope and refuses an invalid one', async () => {
    const { service, agentRunWithoutConversationService } = buildService();
    const scope = {
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: true },
      ],
    };

    await service.generate({
      workspace: WORKSPACE,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApplication: APPLICATION,
      input: { input: MESSAGES, scope },
    });

    expect(
      agentRunWithoutConversationService.runOneShot.mock.calls[0][0].spec
        .inlineConfig?.scope,
    ).toEqual(scope);

    await expect(
      service.generate({
        workspace: WORKSPACE,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        callerApplication: APPLICATION,
        input: { input: MESSAGES, scope: { canReadAllRecords: true } },
      }),
    ).rejects.toBeInstanceOf(AiException);
  });

  it('fails a call with no member, application or API key without recording a turn', async () => {
    const { service } = buildService();

    await expect(
      service.generate({
        workspace: WORKSPACE,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        input: { input: MESSAGES },
      }),
    ).resolves.toMatchObject({ success: false, turnId: null });
  });

  it('reports a failed run', async () => {
    const { service } = buildService({
      outcome: { status: 'FAILED', error: 'provider down' },
    });

    const result = await service.generate({
      workspace: WORKSPACE,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApplication: APPLICATION,
      input: { input: MESSAGES },
    });

    expect(result).toMatchObject({
      success: false,
      error: 'provider down',
      text: null,
    });
  });
});
