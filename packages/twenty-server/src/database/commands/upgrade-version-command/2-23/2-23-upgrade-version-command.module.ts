import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkflowCoreSoftRefFieldCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784286706000-add-workflow-core-soft-ref-field.command';
import { BackfillWorkflowCoreLinksCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784286707000-backfill-workflow-core-links.command';
import { ReconcileSystemRelationFieldUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784565136000-reconcile-system-relation-field-universal-identifier.command';
import { UpgradePeopleDataLabsApplicationCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784565137000-upgrade-people-data-labs-application.command';
import { FixGoToRolesSettingsCommandMenuItemPathCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784566000000-fix-go-to-roles-settings-command-menu-item-path.command';
import { ApplicationUpgradeModule } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity, ApplicationEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
    ApplicationUpgradeModule,
  ],
  providers: [
    AddWorkflowCoreSoftRefFieldCommand,
    BackfillWorkflowCoreLinksCommand,
    ReconcileSystemRelationFieldUniversalIdentifierCommand,
    UpgradePeopleDataLabsApplicationCommand,
    FixGoToRolesSettingsCommandMenuItemPathCommand,
  ],
})
export class V2_23_UpgradeVersionCommandModule {}
