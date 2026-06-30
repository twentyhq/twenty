import { Module } from '@nestjs/common';

import { RestApiCoreModule } from 'src/engine/api/rest/core/rest-api-core.module';

@Module({
  imports: [RestApiCoreModule],
})
export class RestApiModule {}
