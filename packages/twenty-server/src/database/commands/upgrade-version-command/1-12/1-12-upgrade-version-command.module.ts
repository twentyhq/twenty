import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssociateCustomEntitiesToWorkspaceCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-associate-custom-entities-to-workspace-custom-application.command';
import { AssociateStandardEntitiesToTwentyStandardApplicationCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-associate-standard-entities-to-twenty-standard-application.command';
import { CreateWorkspaceCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-create-workspace-custom-application.command';
import { MakeSyncableEntitiesUniversalIdentifierAndApplicationIdNonNullableMigration } from 'src/database/commands/upgrade-version-command/1-12/1-12-make-syncable-entities-universal-identifier-and-application-id-non-nullable-migration.command';
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
    AssociateStandardEntitiesToTwentyStandardApplicationCommand,
    AssociateCustomEntitiesToWorkspaceCustomApplicationCommand,
    CreateWorkspaceCustomApplicationCommand,
    MakeSyncableEntitiesUniversalIdentifierAndApplicationIdNonNullableMigration,
  ],
  exports: [
    AssociateStandardEntitiesToTwentyStandardApplicationCommand,
    AssociateCustomEntitiesToWorkspaceCustomApplicationCommand,
    CreateWorkspaceCustomApplicationCommand,
    MakeSyncableEntitiesUniversalIdentifierAndApplicationIdNonNullableMigration,
  ],
})
export class V1_11_UpgradeVersionCommandModule {}
