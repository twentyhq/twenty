import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { CoreController } from 'src/engine/api/rest/controllers/core.controller';
import { CoreService } from 'src/engine/api/rest/services/core.service';
import { CoreQueryBuilderModule } from 'src/engine/api/rest/core-query-builder/core-query-builder.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ApiRestMetadataController } from 'src/engine/api/rest/controllers/metadata.controller';
import { MetadataService } from 'src/engine/api/rest/services/metadata.service';
import { CoreBatchController } from 'src/engine/api/rest/controllers/core-batch.controller';
import { RestApiService } from 'src/engine/api/rest/services/rest-api.service';

@Module({
  imports: [CoreQueryBuilderModule, AuthModule, HttpModule],
  controllers: [ApiRestMetadataController, CoreBatchController, CoreController],
  providers: [MetadataService, CoreService, RestApiService],
  exports: [MetadataService],
})
export class RestApiModule {}
