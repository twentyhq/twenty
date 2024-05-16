import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { RestApiCoreController } from 'src/engine/api/rest/controllers/rest-api-core.controller';
import { RestApiCoreService } from 'src/engine/api/rest/services/rest-api-core.service';
import { CoreQueryBuilderModule } from 'src/engine/api/rest/rest-api-core-query-builder/core-query-builder.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { RestApiMetadataController } from 'src/engine/api/rest/controllers/rest-api-metadata.controller';
import { RestApiMetadataService } from 'src/engine/api/rest/services/rest-api-metadata.service';
import { RestApiCoreBatchController } from 'src/engine/api/rest/controllers/rest-api-core-batch.controller';
import { RestApiService } from 'src/engine/api/rest/services/rest-api.service';

@Module({
  imports: [CoreQueryBuilderModule, AuthModule, HttpModule],
  controllers: [
    RestApiMetadataController,
    RestApiCoreBatchController,
    RestApiCoreController,
  ],
  providers: [RestApiMetadataService, RestApiCoreService, RestApiService],
  exports: [RestApiMetadataService],
})
export class RestApiModule {}
