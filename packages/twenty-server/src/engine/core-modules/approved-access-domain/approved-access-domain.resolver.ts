import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ApprovedAccessDomainExceptionFilter } from 'src/engine/core-modules/approved-access-domain/approved-access-domain-exception-filter';
import { ApprovedAccessDomain } from 'src/engine/core-modules/approved-access-domain/dtos/approved-access-domain.dto';
import { CreateApprovedAccessDomainInput } from 'src/engine/core-modules/approved-access-domain/dtos/create-approved-access.domain.input';
import { DeleteApprovedAccessDomainInput } from 'src/engine/core-modules/approved-access-domain/dtos/delete-approved-access-domain.input';
import { ValidateApprovedAccessDomainInput } from 'src/engine/core-modules/approved-access-domain/dtos/validate-approved-access-domain.input';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@UseFilters(ApprovedAccessDomainExceptionFilter)
@Resolver()
export class ApprovedAccessDomainResolver {
  constructor(
    private readonly approvedAccessDomainService: ApprovedAccessDomainService,
  ) {}

  @Mutation(() => ApprovedAccessDomain)
  async createApprovedAccessDomain(
    @Args('input') { domain, email }: CreateApprovedAccessDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
    @AuthUser() currentUser: User,
  ): Promise<ApprovedAccessDomain> {
    return this.approvedAccessDomainService.createApprovedAccessDomain(
      domain,
      currentWorkspace,
      currentUser,
      email,
    );
  }

  @Mutation(() => Boolean)
  async deleteApprovedAccessDomain(
    @Args('input') { id }: DeleteApprovedAccessDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<boolean> {
    await this.approvedAccessDomainService.deleteApprovedAccessDomain(
      currentWorkspace,
      id,
    );

    return true;
  }

  @Mutation(() => ApprovedAccessDomain)
  async validateApprovedAccessDomain(
    @Args('input')
    {
      validationToken,
      approvedAccessDomainId,
    }: ValidateApprovedAccessDomainInput,
  ): Promise<ApprovedAccessDomain> {
    return await this.approvedAccessDomainService.validateApprovedAccessDomain({
      validationToken,
      approvedAccessDomainId,
    });
  }

  @Query(() => [ApprovedAccessDomain])
  async getApprovedAccessDomains(
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<Array<ApprovedAccessDomain>> {
    return await this.approvedAccessDomainService.getApprovedAccessDomains(
      currentWorkspace,
    );
  }
}
