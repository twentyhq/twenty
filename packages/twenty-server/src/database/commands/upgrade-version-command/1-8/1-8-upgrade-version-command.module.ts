import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-attachment-author-to-created-by.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, ObjectMetadataEntity]),
    WorkspaceDataSourceModule,
  ],
  providers: [MigrateAttachmentAuthorToCreatedByCommand],
  exports: [MigrateAttachmentAuthorToCreatedByCommand],
})
export class V1_8_UpgradeVersionCommandModule {}
