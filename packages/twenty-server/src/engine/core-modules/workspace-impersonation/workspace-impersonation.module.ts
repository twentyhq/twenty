import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceImpersonationService } from 'src/engine/core-modules/workspace-impersonation/services/workspace-impersonation.service';
import { WorkspaceImpersonationResolver } from 'src/engine/core-modules/workspace-impersonation/workspace-impersonation.resolver';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    AuthModule,
    UserWorkspaceModule,
    PermissionsModule,
    UserRoleModule,
    AuditModule,
    TypeOrmModule.forFeature([UserWorkspace, Workspace, RoleTargetsEntity]),
  ],
  providers: [WorkspaceImpersonationService, WorkspaceImpersonationResolver],
  exports: [WorkspaceImpersonationService],
})
export class WorkspaceImpersonationModule {}
