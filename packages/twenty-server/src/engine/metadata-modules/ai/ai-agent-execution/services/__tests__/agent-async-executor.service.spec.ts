import { Test, type TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { generateText } from 'ai';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
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
  let toolRegistry: { getToolsByCategories: jest.Mock };
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

  beforeEach(async () => {
    toolRegistry = { getToolsByCategories: jest.fn().mockResolvedValue({}) };
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

  it('passes intersectionOf: [agentRoleId] when the agent has a role assigned', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce({ roleId: agentRoleId });

    await service.executeAgent({
      agent: buildAgent(),
      userPrompt: 'test',
      workspaceId,
    });

    expect(toolRegistry.getToolsByCategories).toHaveBeenCalledTimes(1);
    expect(toolRegistry.getToolsByCategories).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: agentRoleId,
        rolePermissionConfig: { intersectionOf: [agentRoleId] },
        workspaceId,
      }),
      expect.objectContaining({ wrapWithErrorContext: false }),
    );
  });

  it('does not resolve registry tools when the agent has no role (fail-closed)', async () => {
    roleTargetRepository.findOne.mockResolvedValueOnce(null);

    await service.executeAgent({
      agent: buildAgent(),
      userPrompt: 'test',
      workspaceId,
    });

    expect(toolRegistry.getToolsByCategories).not.toHaveBeenCalled();
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
        userPrompt: 'test',
        workspaceId,
      });

      expect(result.nativeWebSearchCallCount).toBe(0);
      expect(result.totalCostInDollars).toBeCloseTo(0.0042, 6);
      // credits = dollars * 1_000_000
      expect(result.creditsUsedMicro).toBe(4200);
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
        userPrompt: 'test',
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
