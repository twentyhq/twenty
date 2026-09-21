import { Module } from '@nestjs/common';

import { ApplicationJobResolver } from 'src/engine/core-modules/application/application-job/application-job.resolver';
import { ApplicationJobService } from 'src/engine/core-modules/application/application-job/services/application-job.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [ApplicationJobService, ApplicationJobResolver],
  exports: [ApplicationJobService],
})
export class ApplicationJobModule {}
