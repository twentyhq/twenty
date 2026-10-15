import { Module } from '@nestjs/common';

import { ApplicationReachModule } from 'src/engine/core-modules/authorization/application-reach/application-reach.module';
import { OperationPolicyGuard } from 'src/engine/core-modules/authorization/guards/operation-policy.guard';
import { OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [ApplicationReachModule, PermissionsModule, WorkspaceCacheModule],
  providers: [OperationAuthorizationService, OperationPolicyGuard],
  exports: [
    ApplicationReachModule,
    OperationAuthorizationService,
    OperationPolicyGuard,
  ],
})
export class AuthorizationModule {}
