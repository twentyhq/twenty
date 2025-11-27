import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CleanOrphanedRoleTargetsCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-clean-orphaned-role-targets.command';
import { CleanOrphanedUserWorkspacesCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-clean-orphaned-user-workspaces.command';
import { CreateTwentyStandardApplicationCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-create-twenty-standard-application.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      IndexMetadataEntity,
      ViewEntity,
      UserWorkspaceEntity,
      RoleTargetsEntity,
      ApplicationEntity,
      FeatureFlagEntity,
    ]),
    DataSourceModule,
    WorkspaceSchemaManagerModule,
    ApplicationModule,
  ],
  providers: [
    CleanOrphanedUserWorkspacesCommand,
    CleanOrphanedRoleTargetsCommand,
    CreateTwentyStandardApplicationCommand,
  ],
  exports: [
    CleanOrphanedUserWorkspacesCommand,
    CleanOrphanedRoleTargetsCommand,
    CreateTwentyStandardApplicationCommand,
  ],
})
export class V1_11_UpgradeVersionCommandModule {}
