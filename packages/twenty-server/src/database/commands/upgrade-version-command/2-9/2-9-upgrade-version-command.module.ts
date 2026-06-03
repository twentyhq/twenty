import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { EnsureShahryarMetadataCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000030000-ensure-shahryar-metadata.command';
import { MigrateAiModelPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000000000-migrate-ai-model-preferences.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';

@Module({
  imports: [
    ApplicationModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    ObjectPermissionModule,
    RoleModule,
    TypeOrmModule.forFeature([KeyValuePairEntity, ObjectMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    DevSeederMetadataService,
    EnsureShahryarMetadataCommand,
    MigrateAiModelPreferencesCommand,
  ],
})
export class V2_9_UpgradeVersionCommandModule {}
