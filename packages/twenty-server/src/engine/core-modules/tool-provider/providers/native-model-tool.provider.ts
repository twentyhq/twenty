import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { AgentModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/agent-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class NativeModelToolProvider implements ToolProvider {
  readonly category = ToolCategory.NATIVE_MODEL;

  constructor(
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return isDefined(context.agent);
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    if (!context.agent) {
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
