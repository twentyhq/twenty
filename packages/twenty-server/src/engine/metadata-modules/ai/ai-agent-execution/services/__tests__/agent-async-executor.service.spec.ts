import { Test, type TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { generateText } from 'ai';
import { ToolCategory } from 'twenty-shared/ai';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { STRUCTURED_OUTPUT_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/structured-output-system-prompt.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { NativeToolBinderService } from 'src/engine/metadata-modules/ai/ai-models/services/native-tool-binder.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  generateText: jest.fn().mockResolvedValue({
    text: '',
    steps: [],
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      inputTokenDetails: {
        noCacheTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      outputTokenDetails: { textTokens: 0, reasoningTokens: 0 },
    },
  }),
}));

const generateTextMock = generateText as jest.MockedFunction<
  typeof generateText
>;

describe('AgentAsyncExecutorService — workflow agent role-scoped tool resolution', () => {
  let service: AgentAsyncExecutorService;
  let toolRegistry: {
    getToolsByCategories: jest.Mock;
    buildToolIndex: jest.Mock;
  };
  let roleTargetRepository: { findOne: jest.Mock };
  let aiBillingService: {
    decrementAndCheckAvailableCredits: jest.Mock;
    calculateCost: jest.Mock;
    emitAiTokenUsageEvent: jest.Mock;
    billNativeWebSearchUsage: jest.Mock;
  };

  const agentId = 'agent-1';
  const workspaceId = 'workspace-1';
  const agentRoleId = 'role-1';

  const buildAgent = (): AgentEntity =>
    ({
      id: agentId,
      workspaceId,
      modelId: 'openai/gpt-4.1',
      prompt: 'test prompt',
      modelConfiguration: {},
    }) as AgentEntity;

  const emptyUsage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    inputTokenDetails: {
      noCacheTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    },
    outputTokenDetails: { textTokens: 0, reasoningTokens: 0 },
  };

  beforeEach(async () => {
    toolRegistry = {
      getToolsByCategories: jest.fn().mockResolvedValue({}),
      buildToolIndex: jest.fn().mockResolvedValue([]),
    };
    roleTargetRepository = { findOne: jest.fn() };
    aiBillingService = {
      decrementAndCheckAvailableCredits: jest
        .fn()
        .mockResolvedValue({ hasNoMoreAvailableCredits: false }),
      calculateCost: jest.fn().mockReturnValue(0),
      emitAiTokenUsageEvent: jest.fn(),
      billNativeWebSearchUsage: jest.fn(),
    };

    generateTextMock.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentAsyncExecutorService,
        {
          provide: AiModelRegistryService,
          useValue: {
            validateModelAvailability: jest.fn(),
            resolveModelForAgent: jest.fn().mockResolvedValue({
              modelId: 'openai/gpt-4.1',
              sdkPackage: '@ai-sdk/openai',
              model: {},
            }),
          },
        },
        {
          provide: AiModelConfigService,
          useValue: {
            getReasoningProviderOptions: jest.fn().mockReturnValue({}),
          },
        },
        { provide: ToolRegistryService, useValue: toolRegistry },
        {
          provide: NativeToolBinderService,
          useValue: {
            bind: jest.fn().mockReturnValue({}),
          },
        },
        { provide: AiBillingService, useValue: aiBillingService },
        {
          provide: BillingUsageService,
          useValue: {
            hasAvailableCreditsOrThrow: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MetricsService,
          useValue: {
            incrementCounterForEvent: jest.fn(),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(RoleTargetEntity),
          useValue: roleTargetRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { findOneBy: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    service = module.get<AgentAsyncExecutorService>(AgentAsyncExecutorService);
  });

  it('preloads role-scoped tool schemas by default (workflow node)', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce({ roleId: agentRoleId });

    await service.executeAgent({
      agent: buildAgent(),
      messages: [{ role: 'user', content: 'test' }],
      baseSystemPrompt: 'base system prompt',
      workspaceId,
    });

    expect(toolRegistry.getToolsByCategories).toHaveBeenCalledTimes(1);
    expect(toolRegistry.getToolsByCategories).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: agentRoleId,
        rolePermissionConfig: { intersectionOf: [agentRoleId] },
        requireExplicitObjectGrants: true,
        workspaceId,
      }),
      expect.objectContaining({ wrapWithErrorContext: false }),
    );
    expect(toolRegistry.buildToolIndex).not.toHaveBeenCalled();
  });

  it('loads tools lazily via a category-scoped catalog when toolLoadingStrategy is "lazy" (runAgent)', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce({ roleId: agentRoleId });
    toolRegistry.buildToolIndex.mockResolvedValueOnce([
      {
        name: 'find_many_people',
        category: ToolCategory.DATABASE_CRUD,
        objectName: 'person',
        operation: 'find_many',
      },
      { name: 'create_one_workflow', category: ToolCategory.WORKFLOW },
    ]);

    await service.executeAgent({
      agent: buildAgent(),
      messages: [{ role: 'user', content: 'test' }],
      baseSystemPrompt: 'base system prompt',
      workspaceId,
      toolLoadingStrategy: 'lazy',
    });

    expect(toolRegistry.getToolsByCategories).not.toHaveBeenCalled();
    expect(toolRegistry.buildToolIndex).toHaveBeenCalledWith(
      workspaceId,
      agentRoleId,
      expect.any(Object),
    );

    const { system } = generateTextMock.mock.calls[0][0];

    expect(system).toContain('## Available Tools');
    expect(system).toContain('person');
    expect(system).not.toContain('Workflow Tools');
    expect(system).not.toContain('create_one_workflow');
  });

  it('intersects the agent role with the run-as role on the lazy path used by runAgent', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce({ roleId: agentRoleId });
    toolRegistry.buildToolIndex.mockResolvedValueOnce([]);

    await service.executeAgent({
      agent: buildAgent(),
      messages: [{ role: 'user', content: 'test' }],
      baseSystemPrompt: 'base system prompt',
      workspaceId,
      runAsRoleId: 'run-as-role-id',
      toolLoadingStrategy: 'lazy',
    });

    expect(toolRegistry.buildToolIndex).toHaveBeenCalledWith(
      workspaceId,
      agentRoleId,
      expect.objectContaining({
        rolePermissionConfig: {
          intersectionOf: [agentRoleId, 'run-as-role-id'],
        },
      }),
    );
  });

  it('leaves the lazy path on its default role resolution without a run-as role', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce({ roleId: agentRoleId });
    toolRegistry.buildToolIndex.mockResolvedValueOnce([]);

    await service.executeAgent({
      agent: buildAgent(),
      messages: [{ role: 'user', content: 'test' }],
      baseSystemPrompt: 'base system prompt',
      workspaceId,
      toolLoadingStrategy: 'lazy',
    });

    expect(toolRegistry.buildToolIndex).toHaveBeenCalledWith(
      workspaceId,
      agentRoleId,
      expect.objectContaining({ rolePermissionConfig: undefined }),
    );
  });

  it('does not resolve registry tools when the agent has no role (fail-closed)', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce(null);

    await service.executeAgent({
      agent: buildAgent(),
      messages: [{ role: 'user', content: 'test' }],
      baseSystemPrompt: 'base system prompt',
      workspaceId,
    });

    expect(toolRegistry.getToolsByCategories).not.toHaveBeenCalled();
  });

  it('passes messages to generateText when messages are provided', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce({ roleId: agentRoleId });

    const messages = [
      { role: 'user' as const, content: 'Hello' },
      { role: 'assistant' as const, content: 'Hi' },
      { role: 'user' as const, content: 'Status?' },
    ];

    await service.executeAgent({
      agent: buildAgent(),
      messages,
      baseSystemPrompt: 'base system prompt',
      workspaceId,
    });

    const generateTextArgs = generateTextMock.mock.calls[0][0];

    expect(generateTextArgs.messages).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi' },
      { role: 'user', content: 'Status?' },
    ]);
    expect(generateTextArgs).not.toHaveProperty('prompt');
  });

  it('throws without calling the model when messages are empty', async () => {
    await expect(
      service.executeAgent({
        agent: buildAgent(),
        messages: [],
        baseSystemPrompt: 'base system prompt',
        workspaceId,
      }),
    ).rejects.toThrow(/at least one message/);

    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it('prefixes the system prompt with the caller-supplied base prompt', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce(null);

    await service.executeAgent({
      agent: buildAgent(),
      messages: [{ role: 'user', content: 'test' }],
      baseSystemPrompt: 'caller base prompt',
      workspaceId,
    });

    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'caller base prompt\n\ntest prompt',
      }),
    );
  });

  it('uses the context-neutral structured output prompt regardless of the caller base prompt', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce(null);
    generateTextMock
      .mockResolvedValueOnce({
        text: 'execution result',
        steps: [],
        usage: emptyUsage,
      } as unknown as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: '',
        steps: [],
        usage: emptyUsage,
        output: { summary: 'done' },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

    await service.executeAgent({
      agent: {
        ...buildAgent(),
        responseFormat: {
          type: 'json',
          schema: { type: 'object', properties: {} },
        },
      } as AgentEntity,
      messages: [{ role: 'user', content: 'test' }],
      baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
      workspaceId,
    });

    expect(generateTextMock).toHaveBeenCalledTimes(2);
    expect(generateTextMock.mock.calls[1][0].system).toBe(
      STRUCTURED_OUTPUT_SYSTEM_PROMPT,
    );
    expect(generateTextMock.mock.calls[1][0].system).not.toMatch(/workflow/i);
  });

  describe('cost folding', () => {
    const baseUsage = {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      inputTokenDetails: {
        noCacheTokens: 100,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      outputTokenDetails: { textTokens: 50, reasoningTokens: 0 },
    };

    it('returns token cost only when no native web searches happened', async () => {
      roleTargetRepository.findOne.mockResolvedValueOnce({
        roleId: agentRoleId,
      });
      aiBillingService.calculateCost.mockReturnValue(0.0042);
      generateTextMock.mockResolvedValueOnce({
        text: '',
        steps: [{ toolCalls: [] }],
        usage: baseUsage,
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await service.executeAgent({
        agent: buildAgent(),
        messages: [{ role: 'user', content: 'test' }],
        baseSystemPrompt: 'base system prompt',
        workspaceId,
      });

      expect(result.nativeWebSearchCallCount).toBe(0);
      expect(result.totalCostInDollars).toBeCloseTo(0.0042, 6);
      // credits = dollars * 1_000_000
      expect(result.creditsUsedMicro).toBe(4200);
    });

    it('emits the token total without re-adding cache-creation tokens', async () => {
      roleTargetRepository.findOne.mockResolvedValueOnce({
        roleId: agentRoleId,
      });
      aiBillingService.calculateCost.mockReturnValue(0.0042);
      generateTextMock.mockResolvedValueOnce({
        text: '',
        steps: [
          {
            toolCalls: [],
            providerMetadata: {
              anthropic: { cacheCreationInputTokens: 30 },
            },
          },
        ],
        usage: {
          ...baseUsage,
          // inputTokens (100) is the full prompt: noCache(60) + cacheRead(10) +
          // cacheCreation(30) — the emitted total must not add the 30 again
          inputTokenDetails: {
            noCacheTokens: 60,
            cacheReadTokens: 10,
            cacheWriteTokens: 30,
          },
        },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      await service.executeAgent({
        agent: buildAgent(),
        messages: [{ role: 'user', content: 'test' }],
        baseSystemPrompt: 'base system prompt',
        workspaceId,
      });

      expect(aiBillingService.emitAiTokenUsageEvent).toHaveBeenCalledTimes(1);

      const [, , emittedTotalTokens] =
        aiBillingService.emitAiTokenUsageEvent.mock.calls[0];

      expect(emittedTotalTokens).toBe(150);
    });

    it('folds native web search dollars into totalCostInDollars and creditsUsedMicro', async () => {
      roleTargetRepository.findOne.mockResolvedValueOnce({
        roleId: agentRoleId,
      });
      aiBillingService.calculateCost.mockReturnValue(0.01);
      generateTextMock.mockResolvedValueOnce({
        text: '',
        steps: [
          {
            toolCalls: [
              { toolName: 'web_search' },
              { toolName: 'web_search' },
              { toolName: 'some_other_tool' },
            ],
          },
          { toolCalls: [{ toolName: 'web_search' }] },
        ],
        usage: baseUsage,
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await service.executeAgent({
        agent: buildAgent(),
        messages: [{ role: 'user', content: 'test' }],
        baseSystemPrompt: 'base system prompt',
        workspaceId,
      });

      const expectedSearchCost = 3 * NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS;

      expect(result.nativeWebSearchCallCount).toBe(3);
      expect(result.totalCostInDollars).toBeCloseTo(
        0.01 + expectedSearchCost,
        6,
      );
      expect(result.creditsUsedMicro).toBe(
        Math.round((0.01 + expectedSearchCost) * 1_000_000),
      );
    });
  });
});
