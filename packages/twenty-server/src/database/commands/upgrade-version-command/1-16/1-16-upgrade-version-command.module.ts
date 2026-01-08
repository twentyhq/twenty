import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillOpportunityOwnerFieldCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-opportunity-owner-field.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ApplicationModule,
  ],
  providers: [BackfillOpportunityOwnerFieldCommand],
  exports: [BackfillOpportunityOwnerFieldCommand],
})
export class V1_16_UpgradeVersionCommandModule {}
