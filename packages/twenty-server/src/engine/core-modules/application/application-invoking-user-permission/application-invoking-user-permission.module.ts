import { Module } from '@nestjs/common';

import { ApplicationInvokingUserPermissionResolver } from 'src/engine/core-modules/application/application-invoking-user-permission/application-invoking-user-permission.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [ApplicationInvokingUserPermissionResolver],
})
export class ApplicationInvokingUserPermissionModule {}
