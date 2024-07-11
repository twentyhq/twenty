import { Module } from '@nestjs/common';

import { CustomCodeEngineService } from 'src/engine/integrations/custom-code-engine/custom-code-engine.service';

@Module({
  providers: [CustomCodeEngineService],
  exports: [CustomCodeEngineService],
})
export class CustomCodeEngineModule {}
