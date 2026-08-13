import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddComposeEmailToRelatedPeopleCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-32/2-32-workspace-command-1786400000000-add-compose-email-to-related-people-command-menu-item.command';
import { MakeRequiredFieldsWithoutDefaultsOptionalCommand } from 'src/database/commands/upgrade-version-command/2-32/2-32-workspace-command-1786900000000-make-required-fields-without-defaults-optional.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    AddComposeEmailToRelatedPeopleCommandMenuItemCommand,
    MakeRequiredFieldsWithoutDefaultsOptionalCommand,
  ],
})
export class V2_32_UpgradeVersionCommandModule {}
