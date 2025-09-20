import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { OutboundMessageDomainDriver } from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';
import { OutboundMessageDomainDto } from 'src/engine/core-modules/outbound-message-domain/dtos/outbound-message-domain.dto';
import { OutboundMessageDomainService } from 'src/engine/core-modules/outbound-message-domain/services/outbound-message-domain.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@Resolver(() => OutboundMessageDomainDto)
export class OutboundMessageDomainResolver {
  constructor(
    private readonly outboundMessageDomainService: OutboundMessageDomainService,
  ) {}

  @Mutation(() => OutboundMessageDomainDto)
  async createOutboundMessageDomain(
    @Args('domain') domain: string,
    @Args('driver') driver: OutboundMessageDomainDriver,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<OutboundMessageDomainDto> {
    const outboundMessageDomain =
      await this.outboundMessageDomainService.createOutboundMessageDomain(
        domain,
        driver,
        currentWorkspace,
      );

    return outboundMessageDomain;
  }

  @Mutation(() => Boolean)
  async deleteOutboundMessageDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<boolean> {
    await this.outboundMessageDomainService.deleteOutboundMessageDomain(
      currentWorkspace,
      id,
    );

    return true;
  }

  @Mutation(() => OutboundMessageDomainDto)
  async verifyOutboundMessageDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<OutboundMessageDomainDto> {
    const outboundMessageDomain =
      await this.outboundMessageDomainService.verifyOutboundMessageDomain(
        currentWorkspace,
        id,
      );

    return outboundMessageDomain;
  }

  @Query(() => [OutboundMessageDomainDto])
  async getOutboundMessageDomains(
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<OutboundMessageDomainDto[]> {
    const outboundMessageDomains =
      await this.outboundMessageDomainService.getOutboundMessageDomains(
        currentWorkspace,
      );

    return outboundMessageDomains;
  }
}
