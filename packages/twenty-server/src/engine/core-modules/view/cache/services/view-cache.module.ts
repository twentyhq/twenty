import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewCacheService } from 'src/engine/core-modules/view/cache/services/view-cache.service';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ViewEntity])],
  providers: [ViewCacheService],
  exports: [ViewCacheService],
})
export class ViewCacheModule {}
