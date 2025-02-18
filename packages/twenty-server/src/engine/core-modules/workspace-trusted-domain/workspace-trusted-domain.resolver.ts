import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceTrustedDomainService } from 'src/engine/core-modules/workspace-trusted-domain/services/workspace-trusted-domain.service';
import { WorkspaceTrustedDomain } from 'src/engine/core-modules/workspace-trusted-domain/dtos/trusted-domain.dto';
import { CreateTrustedDomainInput } from 'src/engine/core-modules/workspace-trusted-domain/dtos/create-trusted-domain.input';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { SendTrustedDomainVerificationEmailInput } from 'src/engine/core-modules/workspace-trusted-domain/dtos/send-trusted-domain-verification-email.input';
import { DeleteTrustedDomainInput } from 'src/engine/core-modules/workspace-trusted-domain/dtos/delete-trusted-domain.input';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class WorkspaceTrustedDomainResolver {
  constructor(
    private readonly workspaceTrustedDomainService: WorkspaceTrustedDomainService,
  ) {}

  @Mutation(() => WorkspaceTrustedDomain)
  async create(
    @Args() { domain }: CreateTrustedDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
    @AuthUser() currentUser: User,
  ): Promise<WorkspaceTrustedDomain> {
    return this.workspaceTrustedDomainService.createTrustedDomain(
      domain,
      currentWorkspace,
      currentUser,
    );
  }

  @Mutation(() => null)
  async sendTrustedDomainVerificationEmail(
    @Args() { email, trustedDomainId }: SendTrustedDomainVerificationEmailInput,
    @AuthWorkspace() currentWorkspace: Workspace,
    @AuthUser() currentUser: User,
  ): Promise<void> {
    return await this.workspaceTrustedDomainService.sendTrustedDomainValidationEmail(
      currentUser,
      email,
      currentWorkspace,
      trustedDomainId,
    );
  }

  @Mutation(() => null)
  async deleteTrustedDomain(
    @Args() { id }: DeleteTrustedDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<void> {
    return await this.workspaceTrustedDomainService.deleteTrustedDomain(
      currentWorkspace,
      id,
    );
  }

  @Mutation(() => [WorkspaceTrustedDomain])
  async getAllTrustedDomains(
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<Array<WorkspaceTrustedDomain>> {
    return await this.workspaceTrustedDomainService.getAllTrustedDomainsByWorkspace(
      currentWorkspace,
    );
  }
}
