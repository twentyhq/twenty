import { Module } from '@nestjs/common';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { RecordPermissionPolicyService } from 'src/engine/core-modules/record-permission/services/record-permission-policy.service';
import { RecordPermissionWorkerService } from 'src/engine/core-modules/record-permission/services/record-permission-worker.service';
import { RecordPermissionDispatcherService } from 'src/engine/core-modules/record-permission/services/record-permission-dispatcher.service';
import { RecordPermissionJob } from 'src/engine/core-modules/record-permission/jobs/record-permission.job';
import { RecordPermissionPolicyResolver } from 'src/engine/metadata-modules/record-permissions/record-permission-policy.resolver';
import { RowLevelPermissionModule } from 'src/engine/metadata-modules/row-level-permission-predicate/row-level-permission.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [PermissionsModule, WorkspaceCacheModule, RowLevelPermissionModule],
  providers: [
    RecordPermissionPolicyService,
    RecordPermissionWorkerService,
    RecordPermissionDispatcherService,
    RecordPermissionJob,
    RecordPermissionPolicyResolver,
  ],
  exports: [RecordPermissionPolicyService, RecordPermissionWorkerService],
})
export class RecordPermissionModule {}
