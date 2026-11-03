import { type AgentResponseFormat, ToolCategory } from 'twenty-shared/ai';

import { AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';

const JSON_RESPONSE_FORMAT: AgentResponseFormat = {
  type: 'json',
  schema: {
    type: 'object',
    properties: { answer: { type: 'string' } },
    required: ['answer'],
  },
};

const buildPersona = (
  explicitObjectGrants: ResolvedAgentRunPersona['permissions']['explicitObjectGrants'],
): ResolvedAgentRunPersona => ({
  agentId: null,
  applicationId: 'application-id',
  instructions: 'Answer.',
  modelId: 'model-id',
  modelConfiguration: null,
  responseFormat: null,
  promptCacheKey: 'prompt-cache-key',
  permissions: { agentRoleId: null, scope: null, explicitObjectGrants },
});

const startTurn = async (persona: ResolvedAgentRunPersona) => {
  const startAgentTurn = jest.fn().mockResolvedValue({
    stream: { stream: new ReadableStream() },
    modelConfig: {},
  });
  const service = new AgentRunTurnService(
    { start: startAgentTurn } as never,
    {
      assertAiExecutionAllowed: jest.fn().mockResolvedValue(undefined),
    } as never,
    {
      resolveRunAuthContext: jest
        .fn()
        .mockResolvedValue({ type: 'application' }),
    } as never,
    {} as never,
    { findOneBy: jest.fn().mockResolvedValue(null) } as never,
  );

  const started = await service.startTurn({
    persona,
    responseFormat: JSON_RESPONSE_FORMAT,
    messages: [{ role: 'user', content: 'Hi' }],
    baseSystemPrompt: 'Base prompt.',
    workspaceId: 'workspace-id',
    executionContext: {
      authContext: {} as never,
      turnCreatedBy: {} as never,
      userWorkspaceId: null,
    },
  });

  return {
    started,
    output: startAgentTurn.mock.calls[0][0].output,
    registryAccess: startAgentTurn.mock.calls[0][0].toolset.registryAccess,
  };
};

describe('AgentRunTurnService.startTurn', () => {
  it('asks for the structured output in the same request when the turn has no tools', async () => {
    const { started, output } = await startTurn(buildPersona(null));

    expect(started.isStructuredOutputInSameRequest).toBe(true);
    expect(output).toBeDefined();
  });

  it('asks for the structured output in a follow-up request when the turn has tools', async () => {
    const { started, output } = await startTurn(
      buildPersona({ objectPermissions: [] }),
    );

    expect(started.isStructuredOutputInSameRequest).toBe(false);
    expect(output).toBeUndefined();
  });

  it('offers a scoped run only database tools and the action tools its scope bounds', async () => {
    const { registryAccess } = await startTurn({
      ...buildPersona({ objectPermissions: [] }),
      permissions: {
        agentRoleId: null,
        scope: { objectPermissions: [] },
        explicitObjectGrants: { objectPermissions: [] },
      },
    });
    const isOffered = (name: string, category: ToolCategory) =>
      registryAccess.isToolOffered({ name, category });

    expect(isOffered('find_many_people', ToolCategory.DATABASE_CRUD)).toBe(
      true,
    );
    expect(isOffered('send_email', ToolCategory.ACTION)).toBe(true);
    expect(isOffered('code_interpreter', ToolCategory.ACTION)).toBe(false);
    expect(isOffered('send_campaign', ToolCategory.ACTION)).toBe(false);
  });
});
