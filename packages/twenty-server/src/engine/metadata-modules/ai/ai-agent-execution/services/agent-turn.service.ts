import { Injectable, Logger } from '@nestjs/common';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  type AgentStepLoop,
  type AgentStepLoopInput,
  AgentStepLoopService,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-step-loop.service';
import {
  type AgentToolset,
  type AgentToolsetInput,
  AgentToolsetService,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-toolset.service';
import { getCallLevelProviderOptions } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/provider-options.util';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import {
  AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import { getNativeModelCapabilities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-capabilities.util';

type AgentTurnContext = Pick<
  AgentStepLoopInput,
  'systemPrompt' | 'contextMessages' | 'messages'
>;

type AgentTurnInput = Omit<
  AgentStepLoopInput,
  | 'registeredModel'
  | 'modelConfig'
  | 'systemPrompt'
  | 'contextMessages'
  | 'messages'
  | 'tools'
  | 'offeredPausingToolNames'
  | 'providerOptions'
> & {
  workspace?: WorkspaceEntity;
  modelId: string;
  // the model's own native tools when nativeToolOptions is absent
  toolset: Omit<AgentToolsetInput, 'registeredModel' | 'nativeToolOptions'> & {
    nativeToolOptions?: NativeModelToolOptions;
  };
  buildContext: (turn: {
    registeredModel: RegisteredAiModel;
    modelConfig: AiModelConfig;
    toolset: AgentToolset;
  }) => Promise<AgentTurnContext>;
  promptCacheKey: string;
  shouldIncludeReasoningSummary?: boolean;
};

export type AgentTurn = AgentStepLoop & {
  registeredModel: RegisteredAiModel;
  modelConfig: AiModelConfig;
  toolset: AgentToolset;
};

@Injectable()
export class AgentTurnService {
  private readonly logger = new Logger(AgentTurnService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiModelConfigService: AiModelConfigService,
    private readonly agentToolsetService: AgentToolsetService,
    private readonly agentStepLoopService: AgentStepLoopService,
  ) {}

  async start({
    workspace,
    modelId,
    toolset: toolsetInput,
    buildContext,
    promptCacheKey,
    shouldIncludeReasoningSummary = false,
    ...loopInput
  }: AgentTurnInput): Promise<AgentTurn> {
    this.aiModelRegistryService.validateModelAvailability(modelId);

    const registeredModel = this.aiModelRegistryService.resolveModelForAgent(
      { modelId },
      workspace,
    );
    const modelConfig = this.aiModelRegistryService.getEffectiveModelConfig(
      registeredModel.modelId,
    );
    const nativeCapabilities = getNativeModelCapabilities(
      registeredModel.sdkPackage,
    );

    const toolset = await this.agentToolsetService.build({
      ...toolsetInput,
      registeredModel,
      nativeToolOptions: toolsetInput.nativeToolOptions ?? {
        webSearch: nativeCapabilities?.webSearch === true,
        twitterSearch: nativeCapabilities?.twitterSearch === true,
      },
    });

    const { systemPrompt, contextMessages, messages } = await buildContext({
      registeredModel,
      modelConfig,
      toolset,
    });

    this.logger.log(
      `Starting ${loopInput.metricsScope} turn with model ${registeredModel.modelId}, ${Object.keys(toolset.tools).length} tools`,
    );

    const stepLoop = this.agentStepLoopService.start({
      ...loopInput,
      registeredModel,
      modelConfig,
      systemPrompt,
      contextMessages,
      messages,
      tools: toolset.tools,
      offeredPausingToolNames: toolset.offeredPausingToolNames,
      providerOptions: getCallLevelProviderOptions({
        sdkPackage: registeredModel.sdkPackage,
        providerOptions: this.aiModelConfigService.getReasoningProviderOptions(
          registeredModel,
          { shouldIncludeReasoningSummary },
        ),
        promptCacheKey,
      }),
    });

    return { ...stepLoop, registeredModel, modelConfig, toolset };
  }
}
