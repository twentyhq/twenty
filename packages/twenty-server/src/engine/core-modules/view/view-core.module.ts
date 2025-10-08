import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewEntity]),
    I18nModule,
    WorkspaceCacheStorageModule,
  ],
  providers: [ViewService],
  exports: [ViewService, TypeOrmModule.forFeature([ViewEntity])],
})
export class ViewCoreModule {}

