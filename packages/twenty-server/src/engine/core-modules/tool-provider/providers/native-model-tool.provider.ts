import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { type NativeToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/native-tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ToolCategory } from 'twenty-shared/ai';
import { WebSearchService } from 'src/engine/core-modules/web-search/web-search.service';
import { AgentModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/agent-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

// SDK-native tools (anthropic webSearch, etc.) are opaque and not serializable.
// This provider keeps generateTools() and is excluded from the descriptor system.
@Injectable()
export class NativeModelToolProvider implements NativeToolProvider {
  readonly category = ToolCategory.NATIVE_MODEL;

  constructor(
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly webSearchService: WebSearchService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return isDefined(context.agent);
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    if (!context.agent) {
      return {};
    }

    if (!this.webSearchService.shouldUseNativeSearch()) {
      return {};
    }

    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent(context.agent);

    return this.agentModelConfigService.getNativeModelTools(
      registeredModel,
      context.agent,
    );
  }
}
