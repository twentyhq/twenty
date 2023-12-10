import { Module } from '@nestjs/common';

import { ApiRestController } from 'src/core/api-rest/api-rest.controller';
import { ApiRestService } from 'src/core/api-rest/api-rest.service';
import { ApiRestQueryBuilderModule } from 'src/core/api-rest/api-rest-query-builder/api-rest-query-builder.module';
import { AuthModule } from 'src/core/auth/auth.module';

@Module({
  imports: [ApiRestQueryBuilderModule, AuthModule],
  controllers: [ApiRestController],
  providers: [ApiRestService],
})
export class ApiRestModule {}
