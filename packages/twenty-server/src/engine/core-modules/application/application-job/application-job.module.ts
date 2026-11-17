import { Module } from '@nestjs/common';

import { ApplicationJobResolver } from 'src/engine/core-modules/application/application-job/application-job.resolver';
import { ApplicationJobService } from 'src/engine/core-modules/application/application-job/services/application-job.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { JobGroupModule } from 'src/engine/core-modules/job-group/job-group.module';

@Module({
  imports: [JobGroupModule, WorkspaceCacheModule],
  providers: [ApplicationJobService, ApplicationJobResolver],
})
export class ApplicationJobModule {}
