import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceTrustedDomainService } from 'src/engine/core-modules/workspace-trusted-domain/services/workspace-trusted-domain.service';
import { WorkspaceTrustedDomain } from 'src/engine/core-modules/workspace-trusted-domain/dtos/trusted-domain.dto';
import { CreateTrustedDomainInput } from 'src/engine/core-modules/workspace-trusted-domain/dtos/create-trusted-domain.input';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { DeleteTrustedDomainInput } from 'src/engine/core-modules/workspace-trusted-domain/dtos/delete-trusted-domain.input';
import { ValidateTrustedDomainInput } from 'src/engine/core-modules/workspace-trusted-domain/dtos/validate-trusted-domain.input';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class WorkspaceTrustedDomainResolver {
  constructor(
    private readonly workspaceTrustedDomainService: WorkspaceTrustedDomainService,
  ) {}

  @Mutation(() => WorkspaceTrustedDomain)
  async createWorkspaceTrustedDomain(
    @Args('input') { domain, email }: CreateTrustedDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
    @AuthUser() currentUser: User,
  ): Promise<WorkspaceTrustedDomain> {
    return this.workspaceTrustedDomainService.createTrustedDomain(
      domain,
      currentWorkspace,
      currentUser,
      email,
    );
  }

  @Mutation(() => Boolean)
  async deleteWorkspaceTrustedDomain(
    @Args('input') { id }: DeleteTrustedDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<boolean> {
    await this.workspaceTrustedDomainService.deleteTrustedDomain(
      currentWorkspace,
      id,
    );

    return true;
  }

  @Mutation(() => Boolean)
  async validateWorkspaceTrustedDomain(
    @Args('input')
    { validationToken, workspaceTrustedDomainId }: ValidateTrustedDomainInput,
  ): Promise<boolean> {
    await this.workspaceTrustedDomainService.validateTrustedDomain({
      validationToken,
      workspaceTrustedDomainId,
    });

    return true;
  }

  @Query(() => [WorkspaceTrustedDomain])
  async getAllWorkspaceTrustedDomains(
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<Array<WorkspaceTrustedDomain>> {
    return await this.workspaceTrustedDomainService.getAllTrustedDomainsByWorkspace(
      currentWorkspace,
    );
  }
}
