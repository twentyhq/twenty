import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { WorkflowRunRecordShareModule } from 'src/engine/core-modules/workflow/workflow-run-record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApprovedAccessDomainModule } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserWorkspaceEntityCacheProviderService } from 'src/engine/core-modules/user-workspace/services/user-workspace-entity-cache-provider.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { RoleValidationModule } from 'src/engine/metadata-modules/role-validation/role-validation.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([
      UserWorkspaceEntity,
      UserEntity,
      RoleTargetEntity,
    ]),
    RoleValidationModule,
    ApprovedAccessDomainModule,
    WorkspaceInvitationModule,
    WorkspaceDomainsModule,
    UserRoleModule,
    FileModule,
    TokenModule,
    OnboardingModule,
    CoreEntityCacheModule,
    WorkflowRunRecordShareModule,
  ],
  exports: [UserWorkspaceService, UserWorkspaceAuthContextService],
  providers: [
    UserWorkspaceAuthContextService,
    UserWorkspaceService,
    UserWorkspaceEntityCacheProviderService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
})
export class UserWorkspaceModule {}
