import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-attachment-author-to-created-by.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace]),
    WorkspaceSchemaManagerModule,
  ],
  providers: [MigrateAttachmentAuthorToCreatedByCommand],
  exports: [MigrateAttachmentAuthorToCreatedByCommand],
})
export class V1_10_UpgradeVersionCommandModule {}
