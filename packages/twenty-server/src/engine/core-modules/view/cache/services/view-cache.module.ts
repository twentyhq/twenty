import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewCacheService } from 'src/engine/core-modules/view/cache/services/view-cache.service';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ViewEntity, ViewFieldEntity])],
  providers: [ViewCacheService],
  exports: [ViewCacheService],
})
export class ViewCacheModule {}
