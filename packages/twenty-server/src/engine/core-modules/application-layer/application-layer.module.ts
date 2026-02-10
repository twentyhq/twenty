import { Module } from '@nestjs/common';

import { ApplicationLayerService } from 'src/engine/core-modules/application-layer/application-layer.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [ApplicationLayerService],
  exports: [ApplicationLayerService],
})
export class ApplicationLayerModule {}
