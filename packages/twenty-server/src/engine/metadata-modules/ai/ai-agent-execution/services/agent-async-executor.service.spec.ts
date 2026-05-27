import { generateText } from 'ai';
import { type Repository } from 'typeorm';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { NativeToolBinderService } from 'src/engine/metadata-modules/ai/ai-models/services/native-tool-binder.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  generateText: jest.fn(),
}));

const mockedGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;

describe('AgentAsyncExecutorService', () => {
  const workspaceId = 'workspace-id';
  const agentRoleId = 'agent-role-id';

  const agent = {
    id: 'agent-id',
    workspaceId,
    modelId: 'provider/model',
    prompt: 'Agent prompt',
    modelConfiguration: {
      webSearch: { enabled: true },
      twitterSearch: { enabled: true },
    },
  } as AgentEntity;

  const registeredModel = {
    modelId: 'provider/model',
    model: 'language-model',
  };

  let aiModelRegistryService: jest.Mocked<
    Pick<
      AiModelRegistryService,
      'resolveModelForAgent' | 'validateModelAvailability'
    >
  >;
  let aiModelConfigService: jest.Mocked<
    Pick<AiModelConfigService, 'getProviderOptions'>
  >;
  let toolRegistry: jest.Mocked<
    Pick<ToolRegistryService, 'getToolsByCategories'>
  >;
  let nativeToolBinder: jest.Mocked<Pick<NativeToolBinderService, 'bind'>>;
  let aiBillingService: jest.Mocked<
    Pick<
      AiBillingService,
      'calculateCost' | 'emitAiTokenUsageEvent' | 'billNativeWebSearchUsage'
    >
  >;
  let billingUsageService: jest.Mocked<
    Pick<BillingUsageService, 'hasAvailableCreditsOrThrow'>
  >;
  let roleTargetRepository: jest.Mocked<
    Pick<Repository<RoleTargetEntity>, 'findOne'>
  >;
  let workspaceRepository: jest.Mocked<
    Pick<Repository<WorkspaceEntity>, 'findOneBy'>
  >;
  let service: AgentAsyncExecutorService;

  beforeEach(() => {
    mockedGenerateText.mockResolvedValue({
      text: 'ok',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
      steps: [],
    } as unknown as Awaited<ReturnType<typeof generateText>>);

    aiModelRegistryService = {
      resolveModelForAgent: jest.fn().mockResolvedValue(registeredModel),
      validateModelAvailability: jest.fn(),
    };

    aiModelConfigService = {
      getProviderOptions: jest.fn().mockReturnValue({}),
    };

    toolRegistry = {
      getToolsByCategories: jest.fn().mockResolvedValue({
        registry_tool: {},
      }),
    };

    nativeToolBinder = {
      bind: jest.fn().mockReturnValue({
        native_web_search_tool: {},
      }),
    };

    aiBillingService = {
      calculateCost: jest.fn().mockReturnValue(0),
      emitAiTokenUsageEvent: jest.fn(),
      billNativeWebSearchUsage: jest.fn(),
    };

    billingUsageService = {
      hasAvailableCreditsOrThrow: jest.fn().mockResolvedValue(undefined),
    };

    roleTargetRepository = {
      findOne: jest.fn(),
    };

    workspaceRepository = {
      findOneBy: jest.fn().mockResolvedValue({ id: workspaceId }),
    };

    service = new AgentAsyncExecutorService(
      aiModelRegistryService as unknown as AiModelRegistryService,
      aiModelConfigService as unknown as AiModelConfigService,
      toolRegistry as unknown as ToolRegistryService,
      nativeToolBinder as unknown as NativeToolBinderService,
      aiBillingService as unknown as AiBillingService,
      billingUsageService as unknown as BillingUsageService,
      roleTargetRepository as unknown as Repository<RoleTargetEntity>,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not hydrate registry tools when the agent has no permission role', async () => {
    roleTargetRepository.findOne.mockResolvedValue(null);

    await service.executeAgent({
      agent,
      userPrompt: 'Run',
      workspaceId,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    });

    expect(toolRegistry.getToolsByCategories).not.toHaveBeenCalled();
    expect(nativeToolBinder.bind).toHaveBeenCalledWith(registeredModel, {
      webSearch: true,
      twitterSearch: true,
    });
    expect(mockedGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: {
          native_web_search_tool: {},
        },
      }),
    );
  });

  it('hydrates registry tools with the agent permission role only', async () => {
    roleTargetRepository.findOne.mockResolvedValue({
      roleId: agentRoleId,
    } as RoleTargetEntity);

    await service.executeAgent({
      agent,
      userPrompt: 'Run',
      workspaceId,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    });

    expect(toolRegistry.getToolsByCategories).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: agentRoleId,
        rolePermissionConfig: { unionOf: [agentRoleId] },
      }),
      expect.any(Object),
    );
    expect(mockedGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: {
          registry_tool: {},
          native_web_search_tool: {},
        },
      }),
    );
  });
});
