import { Global, Module } from '@nestjs/common';

import { AiCallContextService } from 'src/engine/metadata-modules/ai/ai-call-context/services/ai-call-context.service';

@Global()
@Module({
  providers: [AiCallContextService],
  exports: [AiCallContextService],
})
export class AiCallContextModule {}
