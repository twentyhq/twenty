import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { SendInvitationsDTO } from 'src/engine/core-modules/workspace-invitation/dtos/send-invitations.dto';
import { WorkspaceInvitation } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { SendInvitationsInput } from './dtos/send-invitations.input';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const WORKSPACE_INVITATION_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE_MEMBERS],
};

@UsePipes(ResolverValidationPipe)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
@MetadataResolver()
export class WorkspaceInvitationResolver {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  @Mutation(() => String)
  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: true,
        oauthClient: true,
        application: false,
      },
      requiredPermissionFlags: [PermissionFlagType.WORKSPACE_MEMBERS],
    }),
  )
  async deleteWorkspaceInvitation(
    @Args('appTokenId') appTokenId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.workspaceInvitationService.deleteWorkspaceInvitation(
      appTokenId,
      workspaceId,
    );
  }

  @Mutation(() => SendInvitationsDTO)
  @UseGuards(AccessPolicyGuard(WORKSPACE_INVITATION_WRITE_ACCESS_POLICY))
  async resendWorkspaceInvitation(
    @Args('appTokenId') appTokenId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
  ) {
    const authContext = buildSystemAuthContext(workspace.id);

    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
          );

        return workspaceMemberRepository.findOneOrFail({
          where: {
            userId: user.id,
          },
        });
      }, authContext);

    return this.workspaceInvitationService.resendWorkspaceInvitation(
      appTokenId,
      workspace,
      workspaceMember,
    );
  }

  @Query(() => [WorkspaceInvitation])
  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: true,
        oauthClient: true,
        application: true,
      },
      requiredPermissionFlags: [PermissionFlagType.WORKSPACE_MEMBERS],
    }),
  )
  async findWorkspaceInvitations(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.workspaceInvitationService.loadWorkspaceInvitations(workspace);
  }

  @Mutation(() => SendInvitationsDTO)
  @UseGuards(AccessPolicyGuard(WORKSPACE_INVITATION_WRITE_ACCESS_POLICY))
  @AllowSuspendedWorkspace()
  async sendInvitations(
    @Args() sendInviteLinkInput: SendInvitationsInput,
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendInvitationsDTO> {
    if (isDefined(sendInviteLinkInput.roleId)) {
      const canAssignRoles =
        await this.settingPermissionsService.hasPermissionFlag({
          authContext: workspaceAuthContextStorage.getStore(),
          permissionFlag: PermissionFlagType.ROLES,
        });

      if (!canAssignRoles) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage: msg`You do not have permission to access this feature. Please contact your workspace administrator for access.`,
          },
        );
      }
    }

    const authContext = buildSystemAuthContext(workspace.id);

    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
          );

        return workspaceMemberRepository.findOneOrFail({
          where: {
            userId: user.id,
          },
        });
      }, authContext);

    return await this.workspaceInvitationService.sendInvitations({
      emails: sendInviteLinkInput.emails,
      workspace,
      sender: workspaceMember,
      roleId: sendInviteLinkInput.roleId ?? undefined,
    });
  }
}
