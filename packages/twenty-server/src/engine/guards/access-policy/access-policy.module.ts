import { Global, Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { AccessPolicyService } from 'src/engine/guards/access-policy/access-policy.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';

// Global so AccessPolicyGuard resolves on any endpoint without its module importing this one
@Global()
@Module({
  imports: [PermissionsModule, FeatureFlagModule],
  providers: [AccessPolicyService],
  exports: [AccessPolicyService],
})
export class AccessPolicyModule {}
