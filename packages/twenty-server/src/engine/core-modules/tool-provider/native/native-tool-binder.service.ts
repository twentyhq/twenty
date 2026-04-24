import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { type NativeToolBinder } from 'src/engine/core-modules/tool-provider/native/native-tool-binder.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import {
  AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';

@Injectable()
export class NativeToolBinderService implements NativeToolBinder {
  constructor(
    private readonly aiModelConfigService: AiModelConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async bind(context: ToolProviderContext): Promise<ToolSet> {
    if (!context.agent) {
      return {};
    }

    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent(context.agent);

    return this.aiModelConfigService.getNativeModelToolsForAgent(
      registeredModel,
      context.agent,
    );
  }

  bindForModel(
    model: RegisteredAiModel,
    options: NativeModelToolOptions = {},
  ): ToolSet {
    return this.aiModelConfigService.getNativeModelTools(model, options);
  }
}
