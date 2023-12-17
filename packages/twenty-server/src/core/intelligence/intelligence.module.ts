import { Module } from '@nestjs/common';

import { OpenApiService } from 'src/core/open-api/open-api.service';

@Module({
  imports: [],
  controllers: [],
  providers: [OpenApiService],
})
export class IntelligenceModule {}
