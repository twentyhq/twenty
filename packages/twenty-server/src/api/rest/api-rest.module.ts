import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ApiRestController } from 'src/api/rest/api-rest.controller';
import { ApiRestService } from 'src/api/rest/api-rest.service';
import { ApiRestQueryBuilderModule } from 'src/api/rest/api-rest-query-builder/api-rest-query-builder.module';
import { AuthModule } from 'src/engine/modules/auth/auth.module';
import { ApiRestMetadataController } from 'src/api/rest/metadata-rest.controller';
import { ApiRestMetadataService } from 'src/api/rest/metadata-rest.service';

@Module({
  imports: [ApiRestQueryBuilderModule, AuthModule, HttpModule],
  controllers: [ApiRestMetadataController, ApiRestController],
  providers: [ApiRestMetadataService, ApiRestService],
  exports: [ApiRestMetadataService],
})
export class ApiRestModule {}
