import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillRecentViewCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-backfill-recent-view.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { ViewFilterGroupModule } from 'src/engine/metadata-modules/view-filter-group/view-filter-group.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      ViewEntity,
    ]),
    WorkspaceSchemaManagerModule,
    ViewModule,
    ViewFilterGroupModule,
    ViewFilterModule,
  ],
  providers: [BackfillRecentViewCommand],
  exports: [BackfillRecentViewCommand],
})
export class V1_12_UpgradeVersionCommandModule {}
