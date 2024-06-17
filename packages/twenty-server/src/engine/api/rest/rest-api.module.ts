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
import { EndingBeforeInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/ending-before-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/limit-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/starting-after-input.factory';

@Module({
  imports: [CoreQueryBuilderModule, AuthModule, HttpModule],
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
