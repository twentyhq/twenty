import { Module } from '@nestjs/common';

import { ApplicationCallerPermissionResolver } from 'src/engine/core-modules/application/application-caller-permission/application-caller-permission.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [ApplicationCallerPermissionResolver],
})
export class ApplicationCallerPermissionModule {}
