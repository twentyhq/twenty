import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { type NativeToolBinder } from 'src/engine/core-modules/tool-provider/native/native-tool-binder.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ToolCategory } from 'twenty-shared/ai';
import { WebSearchService } from 'src/engine/core-modules/web-search/web-search.service';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class NativeToolBinderService implements NativeToolBinder {
  readonly category = ToolCategory.NATIVE_MODEL;

  constructor(
    private readonly aiModelConfigService: AiModelConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly webSearchService: WebSearchService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return isDefined(context.agent);
  }

  async bind(context: ToolProviderContext): Promise<ToolSet> {
    if (!context.agent) {
      return {};
    }

    if (!this.webSearchService.shouldUseNativeSearch()) {
      return {};
    }

    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent(context.agent);

    return this.aiModelConfigService.getNativeModelTools(
      registeredModel,
      context.agent,
    );
  }
}
