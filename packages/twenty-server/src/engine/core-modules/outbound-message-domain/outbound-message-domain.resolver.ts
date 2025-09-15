import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreateOutboundMessageDomainInput } from 'src/engine/core-modules/outbound-message-domain/dtos/create-outbound-message-domain.input';
import { DeleteOutboundMessageDomainInput } from 'src/engine/core-modules/outbound-message-domain/dtos/delete-outbound-message-domain.input';
import { OutboundMessageDomainDto } from 'src/engine/core-modules/outbound-message-domain/dtos/outbound-message-domain.dto';
import { VerifyOutboundMessageDomainInput } from 'src/engine/core-modules/outbound-message-domain/dtos/verify-outbound-message-domain.input';
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
    @Args('input')
    createOutboundMessageDomainInput: CreateOutboundMessageDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<OutboundMessageDomainDto> {
    const outboundMessageDomain =
      await this.outboundMessageDomainService.createOutboundMessageDomain(
        createOutboundMessageDomainInput,
        currentWorkspace,
      );

    return outboundMessageDomain;
  }

  @Mutation(() => Boolean)
  async deleteOutboundMessageDomain(
    @Args('input') { id }: DeleteOutboundMessageDomainInput,
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
    @Args('input') { id }: VerifyOutboundMessageDomainInput,
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
