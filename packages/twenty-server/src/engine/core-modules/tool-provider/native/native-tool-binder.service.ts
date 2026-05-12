import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { type NativeToolBinder } from 'src/engine/core-modules/tool-provider/native/native-tool-binder.interface';

import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';

@Injectable()
export class NativeToolBinderService implements NativeToolBinder {
  constructor(private readonly aiModelConfigService: AiModelConfigService) {}

  bind(
    model: RegisteredAiModel,
    options: NativeModelToolOptions = {},
  ): ToolSet {
    return this.aiModelConfigService.getNativeModelTools(model, options);
  }
}
