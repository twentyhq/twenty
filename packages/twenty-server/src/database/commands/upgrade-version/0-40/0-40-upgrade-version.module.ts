import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateAggregateOperationOptionsCommand } from 'src/database/commands/upgrade-version/0-40/0-40-migrate-aggregate-operations-options.command';
import { UpdateInactiveWorkspaceStatusCommand } from 'src/database/commands/upgrade-version/0-40/0-40-update-inactive-workspace-status.command';
import { UpgradeTo0_40Command } from 'src/database/commands/upgrade-version/0-40/0-40-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Workspace,
        BillingSubscription,
        FeatureFlagEntity,
        KeyValuePair,
        User,
        UserWorkspace,
      ],
      'core',
    ),
    TypeOrmModule.forFeature(
      [
        ObjectMetadataEntity,
        FieldMetadataEntity,
        DataSourceEntity,
        WorkspaceMigrationEntity,
      ],
      'metadata',
    ),
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
    WorkspaceMetadataVersionModule,
    TypeORMModule,
  ],
  providers: [
    UpgradeTo0_40Command,
    MigrateAggregateOperationOptionsCommand,
    UpdateInactiveWorkspaceStatusCommand,
  ],
})
export class UpgradeTo0_40CommandModule {}
