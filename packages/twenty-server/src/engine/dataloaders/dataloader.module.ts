import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';

import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { AgentsByRoleIdLoaderFactory } from 'src/engine/dataloaders/factories/agents-by-role-id-loader.factory';
import { ApiKeysByRoleIdLoaderFactory } from 'src/engine/dataloaders/factories/api-keys-by-role-id-loader.factory';
import { FieldMetadataConnectionLoaderFactory } from 'src/engine/dataloaders/factories/field-metadata-connection-loader.factory';
import { IndexMetadataConnectionLoaderFactory } from 'src/engine/dataloaders/factories/index-metadata-connection-loader.factory';
import { RowLevelPermissionsByRoleIdLoaderFactory } from 'src/engine/dataloaders/factories/row-level-permissions-by-role-id-loader.factory';
import { WorkspaceMembersByRoleIdLoaderFactory } from 'src/engine/dataloaders/factories/workspace-members-by-role-id-loader.factory';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { RowLevelPermissionModule } from 'src/engine/metadata-modules/row-level-permission-predicate/row-level-permission.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    ApplicationTranslationCatalogModule,
    FieldMetadataModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationRegistrationVariableModule,
    ApplicationTranslationModule,
    RowLevelPermissionModule,
    WorkspaceCacheModule,
  ],
  providers: [
    DataloaderService,
    FieldMetadataConnectionLoaderFactory,
    IndexMetadataConnectionLoaderFactory,
    WorkspaceMembersByRoleIdLoaderFactory,
    AgentsByRoleIdLoaderFactory,
    ApiKeysByRoleIdLoaderFactory,
    RowLevelPermissionsByRoleIdLoaderFactory,
  ],
  exports: [DataloaderService],
})
export class DataloaderModule {}
