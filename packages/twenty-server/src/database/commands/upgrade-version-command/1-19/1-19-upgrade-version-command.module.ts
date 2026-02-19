import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillMessageChannelMessageAssociationMessageFolderCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-backfill-message-channel-message-association-message-folder.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    ApplicationModule,
    WorkspaceMigrationModule,
  ],
  providers: [BackfillMessageChannelMessageAssociationMessageFolderCommand],
  exports: [BackfillMessageChannelMessageAssociationMessageFolderCommand],
})
export class V1_19_UpgradeVersionCommandModule {}
