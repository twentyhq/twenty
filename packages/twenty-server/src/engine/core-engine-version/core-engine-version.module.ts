import { Module } from '@nestjs/common';

import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';

@Module({
  providers: [CoreEngineVersionService],
  exports: [CoreEngineVersionService],
})
export class CoreEngineVersionModule {}
