import { Module } from '@nestjs/common';

import { JobGroupConfigByKeyCacheService } from 'src/engine/core-modules/job-group/services/job-group-config-by-key-cache.service';

@Module({
  providers: [JobGroupConfigByKeyCacheService],
})
export class JobGroupModule {}
