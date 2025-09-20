import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';
import { EmailingDomainDto } from 'src/engine/core-modules/emailing-domain/dtos/emailing-domain.dto';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@Resolver(() => EmailingDomainDto)
export class EmailingDomainResolver {
  constructor(private readonly emailingDomainService: EmailingDomainService) {}

  @Mutation(() => EmailingDomainDto)
  async createEmailingDomain(
    @Args('domain') domain: string,
    @Args('driver') driver: EmailingDomainDriver,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<EmailingDomainDto> {
    const emailingDomain =
      await this.emailingDomainService.createEmailingDomain(
        domain,
        driver,
        currentWorkspace,
      );

    return emailingDomain;
  }

  @Mutation(() => Boolean)
  async deleteEmailingDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<boolean> {
    await this.emailingDomainService.deleteEmailingDomain(currentWorkspace, id);

    return true;
  }

  @Mutation(() => EmailingDomainDto)
  async verifyEmailingDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<EmailingDomainDto> {
    const emailingDomain =
      await this.emailingDomainService.verifyEmailingDomain(
        currentWorkspace,
        id,
      );

    return emailingDomain;
  }

  @Query(() => [EmailingDomainDto])
  async getEmailingDomains(
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<EmailingDomainDto[]> {
    const emailingDomains =
      await this.emailingDomainService.getEmailingDomains(currentWorkspace);

    return emailingDomains;
  }
}
