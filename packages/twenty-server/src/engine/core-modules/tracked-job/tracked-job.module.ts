import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { TrackedJobRunnerWorkspaceService } from 'src/engine/core-modules/tracked-job/services/tracked-job-runner.workspace-service';
import { TrackedJobWorkspaceService } from 'src/engine/core-modules/tracked-job/services/tracked-job.workspace-service';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    CoreCommonApiModule,
    UserWorkspaceModule,
    PermissionsModule,
    WorkspaceCacheModule,
  ],
  providers: [TrackedJobWorkspaceService, TrackedJobRunnerWorkspaceService],
  exports: [TrackedJobWorkspaceService, TrackedJobRunnerWorkspaceService],
})
export class TrackedJobModule {}
