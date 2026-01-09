import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillOpportunityOwnerFieldCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-opportunity-owner-field.command';
import { BackfillStandardPageLayoutsCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-standard-page-layouts.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ApplicationModule,
    GlobalWorkspaceDataSourceModule,
    TwentyStandardApplicationModule,
  ],
  providers: [
    BackfillOpportunityOwnerFieldCommand,
    BackfillStandardPageLayoutsCommand,
  ],
  exports: [
    BackfillOpportunityOwnerFieldCommand,
    BackfillStandardPageLayoutsCommand,
  ],
})
export class V1_16_UpgradeVersionCommandModule {}
