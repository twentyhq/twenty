import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-attachment-author-to-created-by.command';

@Module({
  imports: [
    TwentyORMModule,
    TypeOrmModule.forFeature([Workspace, ObjectMetadataEntity], 'core'),
  ],
  providers: [MigrateAttachmentAuthorToCreatedByCommand],
})
export class UpgradeVersion1_8CommandModule {}
