import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { PublicDomainExceptionFilter } from 'src/engine/core-modules/public-domain/public-domain-exception-filter';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { PublicDomainDTO } from 'src/engine/core-modules/public-domain/dtos/public-domain.dto';
import { PublicDomainInput } from 'src/engine/core-modules/public-domain/dtos/public-domain.input';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PublicDomainExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@Resolver()
export class PublicDomainResolver {
  constructor(private readonly publicDomainService: PublicDomainService) {}

  @Mutation(() => PublicDomainDTO)
  async createPublicDomain(
    @Args() { domain }: PublicDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<PublicDomainDTO> {
    return this.publicDomainService.createPublicDomain({
      domain,
      workspace: currentWorkspace,
    });
  }

  @Mutation(() => Boolean)
  async deletePublicDomain(
    @Args() { domain }: PublicDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<boolean> {
    await this.publicDomainService.deletePublicDomain({
      domain,
      workspace: currentWorkspace,
    });

    return true;
  }
}
