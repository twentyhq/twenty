import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateWorkspaceCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-create-workspace-custom-application.command';
import { SetStandardApplicationNotUninstallableCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-set-standard-application-not-uninstallable.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    WorkspaceSchemaManagerModule,
    ApplicationModule,
  ],
  providers: [
    CreateWorkspaceCustomApplicationCommand,
    SetStandardApplicationNotUninstallableCommand,
  ],
  exports: [
    CreateWorkspaceCustomApplicationCommand,
    SetStandardApplicationNotUninstallableCommand,
  ],
})
export class V1_12_UpgradeVersionCommandModule {}
