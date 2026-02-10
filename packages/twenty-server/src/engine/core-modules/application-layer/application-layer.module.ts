import { Module } from '@nestjs/common';

import { ApplicationLayerService } from 'src/engine/core-modules/application-layer/application-layer.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';

@Module({
  imports: [WorkspaceCacheModule, FileModule],
  providers: [ApplicationLayerService],
  exports: [ApplicationLayerService],
})
export class ApplicationLayerModule {}
