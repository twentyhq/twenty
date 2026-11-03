import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
import { type AgentRunInlineConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-inline-config.type';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';

const INLINE_CONFIG: AgentRunInlineConfig = {
  instructions: 'Summarize the record.',
  modelId: 'model-id',
  modelConfiguration: null,
  scope: {},
  promptCacheKey: 'workflow-step:step-id',
  applicationId: 'application-id',
};

const buildService = (flatApplicationsById: Record<string, object>) =>
  new AgentRunPersonaService(
    {} as never,
    {} as never,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatApplicationMaps: { byId: flatApplicationsById },
      }),
    } as never,
    {} as never,
  );

describe('AgentRunPersonaService', () => {
  it('runs a step without an agent under its application', async () => {
    const persona = await buildService({
      'application-id': { id: 'application-id', deletedAt: null },
    }).resolveOrThrow({
      workspaceId: WORKSPACE_ID,
      spec: { agentId: null, inlineConfig: INLINE_CONFIG },
    });

    expect(persona.applicationId).toBe('application-id');
    expect(persona.permissions.scope).toEqual({});
  });

  it.each([
    ['no longer exists', {}],
    [
      'was deleted',
      { 'application-id': { id: 'application-id', deletedAt: new Date() } },
    ],
  ])(
    'fails a step without an agent whose application %s',
    async (_, flatApplicationsById) => {
      await expect(
        buildService(flatApplicationsById).resolveOrThrow({
          workspaceId: WORKSPACE_ID,
          spec: { agentId: null, inlineConfig: INLINE_CONFIG },
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
    },
  );
});

describe('AgentRunPersonaService.resolveRunAuthContext', () => {
  const service = buildService({});
  const authContext = {
    type: 'apiKey',
    workspace: { id: WORKSPACE_ID },
    apiKey: { id: 'api-key-id' },
  } as WorkspaceAuthContext;

  it("narrows the caller to the run's agent", async () => {
    expect(
      await service.resolveRunAuthContext({
        workspaceId: WORKSPACE_ID,
        persona: {
          agentId: 'agent-id',
          permissions: {
            agentRoleId: 'agent-role-id',
            scope: null,
            explicitObjectGrants: { objectPermissions: [] },
          },
        },
        authContext,
      }),
    ).toMatchObject({ type: 'apiKey', agentId: 'agent-id' });
  });

  it('reads nothing for a run handed no data access', async () => {
    expect(
      await service.resolveRunAuthContext({
        workspaceId: WORKSPACE_ID,
        persona: {
          agentId: null,
          permissions: {
            agentRoleId: null,
            scope: null,
            explicitObjectGrants: null,
          },
        },
        authContext,
      }),
    ).toBeUndefined();
  });
});
