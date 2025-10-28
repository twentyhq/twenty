import { Module } from '@nestjs/common';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { coreQueryBuilderFactories } from 'src/engine/api/rest/core/query-builder/factories/factories';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    AuthModule,
    ApiKeyModule,
    WorkspaceDomainsModule,
    FeatureFlagModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataCacheModule,
    WorkspacePermissionsCacheModule,
  ],
  providers: [...coreQueryBuilderFactories, CoreQueryBuilderFactory],
  exports: [CoreQueryBuilderFactory],
})
export class CoreQueryBuilderModule {}
