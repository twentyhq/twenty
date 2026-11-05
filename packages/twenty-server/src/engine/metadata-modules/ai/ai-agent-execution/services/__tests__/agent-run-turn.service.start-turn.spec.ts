import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type AgentResponseFormat, ToolCategory } from 'twenty-shared/ai';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
import { AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { AgentTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-turn.service';
import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';

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
  const moduleRef = await Test.createTestingModule({
    providers: [
      AgentRunTurnService,
      { provide: AgentTurnService, useValue: { start: startAgentTurn } },
      {
        provide: AiBillingService,
        useValue: {
          assertAiExecutionAllowed: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: AgentRunPersonaService,
        useValue: {
          resolveRunAuthContext: jest
            .fn()
            .mockResolvedValue({ type: 'application' }),
        },
      },
      { provide: RunAgentAttachmentService, useValue: {} },
      {
        provide: getRepositoryToken(WorkspaceEntity),
        useValue: {
          findOneBy: jest.fn().mockResolvedValue({ id: 'workspace-id' }),
        },
      },
    ],
  }).compile();
  const service = moduleRef.get(AgentRunTurnService);

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
