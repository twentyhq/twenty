import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillFieldsWidgetNewFieldDefaultVisibilityCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000030000-backfill-fields-widget-new-field-default-visibility.command';
import { MigrateAiModelPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000000000-migrate-ai-model-preferences.command';
import { MoveDemotedStandardFieldsToCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000040000-move-demoted-standard-fields-to-custom-application.command';
import { RenameConflictingCustomFieldsCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000045000-rename-conflicting-custom-fields.command';
import { AddInactiveGenericStandardFieldsCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000050000-add-inactive-generic-standard-fields.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([KeyValuePairEntity, FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    MigrateAiModelPreferencesCommand,
    MoveDemotedStandardFieldsToCustomApplicationCommand,
    RenameConflictingCustomFieldsCommand,
    AddInactiveGenericStandardFieldsCommand,
    BackfillFieldsWidgetNewFieldDefaultVisibilityCommand,
  ],
})
export class V2_9_UpgradeVersionCommandModule {}
