import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ApiRestController } from 'src/engine/api/rest/controllers/api-rest.controller';
import { ApiRestService } from 'src/engine/api/rest/api-rest.service';
import { ApiRestQueryBuilderModule } from 'src/engine/api/rest/api-rest-query-builder/api-rest-query-builder.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ApiRestMetadataController } from 'src/engine/api/rest/controllers/metadata-rest.controller';
import { ApiRestMetadataService } from 'src/engine/api/rest/metadata-rest.service';
import { BatchApiRestController } from 'src/engine/api/rest/controllers/batch-api-rest.controller';

@Module({
  imports: [ApiRestQueryBuilderModule, AuthModule, HttpModule],
  controllers: [
    ApiRestMetadataController,
    BatchApiRestController,
    ApiRestController,
  ],
  providers: [ApiRestMetadataService, ApiRestService],
  exports: [ApiRestMetadataService],
})
export class ApiRestModule {}
