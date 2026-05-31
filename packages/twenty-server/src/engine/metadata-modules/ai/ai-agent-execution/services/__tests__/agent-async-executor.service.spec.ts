import { Test, type TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
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

describe('AgentAsyncExecutorService — workflow agent role-scoped tool resolution', () => {
  let service: AgentAsyncExecutorService;
  let toolRegistry: { getToolsByCategories: jest.Mock };
  let roleTargetRepository: { findOne: jest.Mock };

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
        {
          provide: AiBillingService,
          useValue: {
            decrementAndCheckAvailableCredits: jest
              .fn()
              .mockResolvedValue({ hasNoMoreAvailableCredits: false }),
            calculateCost: jest.fn().mockReturnValue(0),
            emitAiTokenUsageEvent: jest.fn(),
            billNativeWebSearchUsage: jest.fn(),
          },
        },
        {
          provide: BillingUsageService,
          useValue: {
            hasAvailableCreditsOrThrow: jest.fn().mockResolvedValue(undefined),
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

  it('passes unionOf: [agentRoleId] when the agent has a role assigned', async () => {
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
        rolePermissionConfig: { unionOf: [agentRoleId] },
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
});
