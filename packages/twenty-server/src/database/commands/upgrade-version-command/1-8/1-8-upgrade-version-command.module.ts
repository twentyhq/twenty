import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-attachment-author-to-created-by.command';

@Module({
  imports: [TwentyORMModule, TypeOrmModule.forFeature([Workspace])],
  providers: [MigrateAttachmentAuthorToCreatedByCommand],
  exports: [MigrateAttachmentAuthorToCreatedByCommand],
})
export class V1_8_UpgradeVersionCommandModule {}
