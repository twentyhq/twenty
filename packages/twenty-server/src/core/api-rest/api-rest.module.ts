import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ApiRestController } from 'src/core/api-rest/api-rest.controller';
import { ApiRestService } from 'src/core/api-rest/api-rest.service';
import { ApiRestQueryBuilderModule } from 'src/core/api-rest/api-rest-query-builder/api-rest-query-builder.module';
import { AuthModule } from 'src/core/auth/auth.module';
import { ApiRestMetadataController } from 'src/core/api-rest/metadata-rest.controller';
import { ApiRestMetadataService } from 'src/core/api-rest/metadata-rest.service';

@Module({
  imports: [ApiRestQueryBuilderModule, AuthModule, HttpModule],
  controllers: [ApiRestMetadataController, ApiRestController],
  providers: [ApiRestMetadataService, ApiRestService],
})
export class ApiRestModule {}
