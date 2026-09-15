import { Module } from '@nestjs/common';

import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [ImpersonationAuthorizationService],
  exports: [ImpersonationAuthorizationService],
})
export class ImpersonationAuthorizationModule {}
