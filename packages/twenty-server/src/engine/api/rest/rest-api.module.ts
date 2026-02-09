import { Module } from '@nestjs/common';

import { MetadataQueryBuilderModule } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.module';
import { RestApiMetadataService } from 'src/engine/api/rest/metadata/rest-api-metadata.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { SecureHttpClientService } from 'src/engine/core-modules/tool/services/secure-http-client.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { RestApiCoreModule } from 'src/engine/api/rest/core/rest-api-core.module';
import { RestApiService } from 'src/engine/api/rest/rest-api.service';
import { RestApiMetadataController } from 'src/engine/api/rest/metadata/rest-api-metadata.controller';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    MetadataQueryBuilderModule,
    WorkspaceCacheStorageModule,
    AuthModule,
    RestApiCoreModule,
    PermissionsModule,
  ],
  controllers: [RestApiMetadataController],
  providers: [RestApiService, RestApiMetadataService, SecureHttpClientService],
  exports: [RestApiMetadataService, RestApiService],
})
export class RestApiModule {}
