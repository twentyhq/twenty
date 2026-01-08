import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SyncDashboardPageLayoutDeletedAtCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-sync-dashboard-page-layout-deleted-at.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      PageLayoutEntity,
      PageLayoutTabEntity,
      PageLayoutWidgetEntity,
    ]),
    DataSourceModule,
  ],
  providers: [SyncDashboardPageLayoutDeletedAtCommand],
  exports: [SyncDashboardPageLayoutDeletedAtCommand],
})
export class V1_16_UpgradeVersionCommandModule {}
