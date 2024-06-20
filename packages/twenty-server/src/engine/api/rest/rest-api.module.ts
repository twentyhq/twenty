import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { RestApiCoreController } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';
import { RestApiCoreService } from 'src/engine/api/rest/core/rest-api-core.service';
import { CoreQueryBuilderModule } from 'src/engine/api/rest/core/query-builder/core-query-builder.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { RestApiMetadataController } from 'src/engine/api/rest/metadata/rest-api-metadata.controller';
import { RestApiMetadataService } from 'src/engine/api/rest/metadata/rest-api-metadata.service';
import { RestApiCoreBatchController } from 'src/engine/api/rest/core/controllers/rest-api-core-batch.controller';
import { RestApiService } from 'src/engine/api/rest/rest-api.service';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';
import { MetadataQueryBuilderModule } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.module';

@Module({
  imports: [
    CoreQueryBuilderModule,
    MetadataQueryBuilderModule,
    AuthModule,
    HttpModule,
  ],
  controllers: [
    RestApiMetadataController,
    RestApiCoreBatchController,
    RestApiCoreController,
  ],
  providers: [
    RestApiMetadataService,
    RestApiCoreService,
    RestApiService,
    StartingAfterInputFactory,
    EndingBeforeInputFactory,
    LimitInputFactory,
  ],
  exports: [RestApiMetadataService],
})
export class RestApiModule {}
