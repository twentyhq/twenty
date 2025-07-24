import { Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards, UsePipes } from '@nestjs/common';

import { CustomDomainValidRecords } from 'src/engine/core-modules/domain-manager/dtos/custom-domain-valid-records';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';

@UsePipes(ResolverValidationPipe)
@Resolver()
export class DomainManagerResolver {
  constructor(private readonly customDomainService: CustomDomainService) {}

  @Mutation(() => CustomDomainValidRecords, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async checkCustomDomainValidRecords(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<CustomDomainValidRecords | undefined> {
    return this.customDomainService.checkCustomDomainValidRecords(workspace);
  }
}
