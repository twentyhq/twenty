import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { SetStandardApplicationNotUninstallableCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-set-standard-application-not-uninstallable.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, ApplicationEntity]),
    WorkspaceSchemaManagerModule,
    ApplicationModule,
  ],
  providers: [SetStandardApplicationNotUninstallableCommand],
  exports: [SetStandardApplicationNotUninstallableCommand],
})
export class V1_12_UpgradeVersionCommandModule {}
