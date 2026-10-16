import { Module } from '@nestjs/common';

import { OperationPolicyGuard } from 'src/engine/core-modules/authorization/guards/operation-policy.guard';
import { OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [PermissionsModule, WorkspaceCacheModule],
  providers: [OperationAuthorizationService, OperationPolicyGuard],
  exports: [OperationAuthorizationService, OperationPolicyGuard],
})
export class AuthorizationModule {}
