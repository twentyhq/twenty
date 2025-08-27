import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PopulateMessageFolderFieldsCommand } from 'src/database/commands/upgrade-version-command/1-4/1-4-populate-message-folder-fields.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TwentyORMModule,
    WorkspaceDataSourceModule,
    FeatureFlagModule,
    MessagingModule,
  ],
  providers: [PopulateMessageFolderFieldsCommand],
  exports: [PopulateMessageFolderFieldsCommand],
})
export class V1_4_UpgradeVersionCommandModule {}
