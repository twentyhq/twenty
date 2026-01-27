import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillOpportunityOwnerFieldCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-opportunity-owner-field.command';
import { BackfillStandardPageLayoutsCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-standard-page-layouts.command';
import { FlushV2CacheAndIncrementMetadataVersionCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-flush-v2-cache-and-increment-metadata-version.command';
import { IdentifyAgentMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-agent-metadata.command';
import { IdentifyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-field-metadata.command';
import { IdentifyIndexMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-index-metadata.command';
import { IdentifyObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-object-metadata.command';
import { IdentifyRemainingEntitiesMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-remaining-entities-metadata.command';
import { IdentifyRoleMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-role-metadata.command';
import { IdentifyViewFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-field-metadata.command';
import { IdentifyViewFilterMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-filter-metadata.command';
import { IdentifyViewGroupMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-group-metadata.command';
import { IdentifyViewMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-metadata.command';
import { MakeAgentUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-agent-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-field-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeIndexMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-index-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-object-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeRemainingEntitiesUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-remaining-entities-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeRoleUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-role-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-field-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewFilterUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-filter-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewGroupUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-group-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-universal-identifier-and-application-id-not-nullable-migration.command';
import { UpdateTaskOnDeleteActionCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-update-task-on-delete-action.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      AgentEntity,
      FieldMetadataEntity,
      IndexMetadataEntity,
      ObjectMetadataEntity,
      RoleEntity,
      ViewEntity,
      ViewFieldEntity,
      ViewFilterEntity,
      ViewGroupEntity,
    ]),
    DataSourceModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ApplicationModule,
    GlobalWorkspaceDataSourceModule,
    TwentyStandardApplicationModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    UpdateTaskOnDeleteActionCommand,
    BackfillOpportunityOwnerFieldCommand,
    BackfillStandardPageLayoutsCommand,
    IdentifyAgentMetadataCommand,
    IdentifyFieldMetadataCommand,
    IdentifyIndexMetadataCommand,
    IdentifyObjectMetadataCommand,
    IdentifyRoleMetadataCommand,
    IdentifyViewMetadataCommand,
    IdentifyViewFieldMetadataCommand,
    IdentifyViewFilterMetadataCommand,
    MakeAgentUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    IdentifyViewGroupMetadataCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeRoleUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewFilterUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewGroupUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeIndexMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeRemainingEntitiesUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    IdentifyRemainingEntitiesMetadataCommand,
    FlushV2CacheAndIncrementMetadataVersionCommand,
  ],
  exports: [
    UpdateTaskOnDeleteActionCommand,
    BackfillOpportunityOwnerFieldCommand,
    BackfillStandardPageLayoutsCommand,
    IdentifyAgentMetadataCommand,
    IdentifyFieldMetadataCommand,
    IdentifyIndexMetadataCommand,
    IdentifyObjectMetadataCommand,
    IdentifyRoleMetadataCommand,
    IdentifyViewMetadataCommand,
    IdentifyViewFieldMetadataCommand,
    IdentifyViewFilterMetadataCommand,
    MakeAgentUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    IdentifyViewGroupMetadataCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeRoleUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewFilterUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewGroupUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeIndexMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeRemainingEntitiesUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    IdentifyRemainingEntitiesMetadataCommand,
    FlushV2CacheAndIncrementMetadataVersionCommand,
  ],
})
export class V1_16_UpgradeVersionCommandModule {}
