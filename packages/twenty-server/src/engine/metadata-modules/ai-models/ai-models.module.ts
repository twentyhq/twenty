import { Global, Module } from '@nestjs/common';

import { AiModelRegistryService } from 'src/engine/metadata-modules/ai-models/services/ai-model-registry.service';
import { AiService } from 'src/engine/metadata-modules/ai-models/services/ai.service';

@Global()
@Module({
  providers: [AiModelRegistryService, AiService],
  exports: [AiModelRegistryService, AiService],
})
export class AiModelsModule {}
