import { Module } from '@nestjs/common';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { coreQueryBuilderFactories } from 'src/engine/api/rest/core/query-builder/factories/factories';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    ObjectMetadataModule,
    AuthModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataCacheModule,
  ],
  providers: [...coreQueryBuilderFactories, CoreQueryBuilderFactory],
  exports: [CoreQueryBuilderFactory],
})
export class CoreQueryBuilderModule {}
