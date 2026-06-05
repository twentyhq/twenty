import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { ImpersonationResolver } from 'src/engine/core-modules/impersonation/impersonation.resolver';
import { ImpersonationService } from 'src/engine/core-modules/impersonation/services/impersonation.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    AuthModule,
    UserWorkspaceModule,
    PermissionsModule,
    RoleModule,
    UserRoleModule,
    EventLogEmitterModule,
    TypeOrmModule.forFeature([
      UserWorkspaceEntity,
      WorkspaceEntity,
      UserEntity,
    ]),
    WorkspaceDomainsModule,
    PermissionsModule,
  ],
  providers: [ImpersonationService, ImpersonationResolver],
  exports: [ImpersonationService],
})
export class ImpersonationModule {}
