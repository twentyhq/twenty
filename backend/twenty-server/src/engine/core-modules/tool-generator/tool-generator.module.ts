import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { PerObjectToolGeneratorService } from './services/per-object-tool-generator.service';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [PerObjectToolGeneratorService],
  exports: [PerObjectToolGeneratorService],
})
export class ToolGeneratorModule {}
