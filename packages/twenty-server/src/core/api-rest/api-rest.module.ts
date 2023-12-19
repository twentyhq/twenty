import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ApiRestController } from 'src/core/api-rest/api-rest.controller';
import { ApiRestService } from 'src/core/api-rest/api-rest.service';
import { ApiRestQueryBuilderModule } from 'src/core/api-rest/api-rest-query-builder/api-rest-query-builder.module';
import { AuthModule } from 'src/core/auth/auth.module';

@Module({
  imports: [ApiRestQueryBuilderModule, AuthModule, HttpModule],
  controllers: [ApiRestController],
  providers: [ApiRestService],
})
export class ApiRestModule {}
