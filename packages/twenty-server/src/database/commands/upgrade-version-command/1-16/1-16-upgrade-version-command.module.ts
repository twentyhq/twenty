import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdentifyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-field-metadata.command';
import { MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-field-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, FieldMetadataEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ApplicationModule,
    GlobalWorkspaceDataSourceModule,
    TwentyStandardApplicationModule,
  ],
  providers: [
    IdentifyFieldMetadataCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
  ],
  exports: [
    IdentifyFieldMetadataCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
  ],
})
export class V1_16_UpgradeVersionCommandModule {}
