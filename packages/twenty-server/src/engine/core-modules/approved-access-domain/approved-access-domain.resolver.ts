import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ApprovedAccessDomainExceptionFilter } from 'src/engine/core-modules/approved-access-domain/approved-access-domain-exception-filter';
import { ApprovedAccessDomainDTO } from 'src/engine/core-modules/approved-access-domain/dtos/approved-access-domain.dto';
import { CreateApprovedAccessDomainInput } from 'src/engine/core-modules/approved-access-domain/dtos/create-approved-access.domain.input';
import { DeleteApprovedAccessDomainInput } from 'src/engine/core-modules/approved-access-domain/dtos/delete-approved-access-domain.input';
import { ValidateApprovedAccessDomainInput } from 'src/engine/core-modules/approved-access-domain/dtos/validate-approved-access-domain.input';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionsGuard(PermissionFlagType.WORKSPACE_MEMBERS),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  ApprovedAccessDomainExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@Resolver()
export class ApprovedAccessDomainResolver {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly approvedAccessDomainService: ApprovedAccessDomainService,
  ) {}

  @Mutation(() => ApprovedAccessDomainDTO)
  async createApprovedAccessDomain(
    @Args('input') { domain, email }: CreateApprovedAccessDomainInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUser() currentUser: UserEntity,
  ): Promise<ApprovedAccessDomainDTO> {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        currentWorkspace.id,
        'workspaceMember',
      );

    const workspaceMember = await workspaceMemberRepository.findOneOrFail({
      where: {
        userId: currentUser.id,
      },
    });

    return this.approvedAccessDomainService.createApprovedAccessDomain(
      domain,
      currentWorkspace,
      workspaceMember,
      email,
    );
  }

  @Mutation(() => Boolean)
  async deleteApprovedAccessDomain(
    @Args('input') { id }: DeleteApprovedAccessDomainInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.approvedAccessDomainService.deleteApprovedAccessDomain(
      currentWorkspace,
      id,
    );

    return true;
  }

  @Mutation(() => ApprovedAccessDomainDTO)
  async validateApprovedAccessDomain(
    @Args('input')
    {
      validationToken,
      approvedAccessDomainId,
    }: ValidateApprovedAccessDomainInput,
  ): Promise<ApprovedAccessDomainDTO> {
    return await this.approvedAccessDomainService.validateApprovedAccessDomain({
      validationToken,
      approvedAccessDomainId,
    });
  }

  @Query(() => [ApprovedAccessDomainDTO])
  async getApprovedAccessDomains(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<Array<ApprovedAccessDomainDTO>> {
    return await this.approvedAccessDomainService.getApprovedAccessDomains(
      currentWorkspace,
    );
  }
}
