import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/core-modules/view/flat-view/services/workspace-flat-view-map-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([ViewEntity])],
  providers: [WorkspaceFlatViewMapCacheService],
  exports: [WorkspaceFlatViewMapCacheService],
})
export class FlatViewModule {}
