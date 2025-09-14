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

    return {
      id: outboundMessageDomain.id,
      domain: outboundMessageDomain.domain,
      driver: outboundMessageDomain.driver,
      status: outboundMessageDomain.status,
      syncStatus: outboundMessageDomain.syncStatus,
      verifiedAt: outboundMessageDomain.verifiedAt,
      lastSyncedAt: outboundMessageDomain.lastSyncedAt,
      syncError: outboundMessageDomain.syncError,
      createdAt: outboundMessageDomain.createdAt,
      updatedAt: outboundMessageDomain.updatedAt,
    };
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
    @Args('input') { id, verificationToken }: VerifyOutboundMessageDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<OutboundMessageDomainDto> {
    const outboundMessageDomain =
      await this.outboundMessageDomainService.verifyOutboundMessageDomain(
        currentWorkspace,
        id,
        verificationToken,
      );

    return {
      id: outboundMessageDomain.id,
      domain: outboundMessageDomain.domain,
      driver: outboundMessageDomain.driver,
      status: outboundMessageDomain.status,
      syncStatus: outboundMessageDomain.syncStatus,
      verifiedAt: outboundMessageDomain.verifiedAt,
      lastSyncedAt: outboundMessageDomain.lastSyncedAt,
      syncError: outboundMessageDomain.syncError,
      createdAt: outboundMessageDomain.createdAt,
      updatedAt: outboundMessageDomain.updatedAt,
    };
  }

  @Mutation(() => OutboundMessageDomainDto)
  async syncOutboundMessageDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<OutboundMessageDomainDto> {
    const outboundMessageDomain =
      await this.outboundMessageDomainService.syncOutboundMessageDomain(
        currentWorkspace,
        id,
      );

    return {
      id: outboundMessageDomain.id,
      domain: outboundMessageDomain.domain,
      driver: outboundMessageDomain.driver,
      status: outboundMessageDomain.status,
      syncStatus: outboundMessageDomain.syncStatus,
      verifiedAt: outboundMessageDomain.verifiedAt,
      lastSyncedAt: outboundMessageDomain.lastSyncedAt,
      syncError: outboundMessageDomain.syncError,
      createdAt: outboundMessageDomain.createdAt,
      updatedAt: outboundMessageDomain.updatedAt,
    };
  }

  @Query(() => [OutboundMessageDomainDto])
  async getOutboundMessageDomains(
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<OutboundMessageDomainDto[]> {
    const outboundMessageDomains =
      await this.outboundMessageDomainService.getOutboundMessageDomains(
        currentWorkspace,
      );

    return outboundMessageDomains.map((domain) => ({
      id: domain.id,
      domain: domain.domain,
      driver: domain.driver,
      status: domain.status,
      syncStatus: domain.syncStatus,
      verifiedAt: domain.verifiedAt,
      lastSyncedAt: domain.lastSyncedAt,
      syncError: domain.syncError,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    }));
  }

  @Query(() => String)
  async getOutboundMessageDomainVerificationToken(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<string> {
    return await this.outboundMessageDomainService.getVerificationToken(
      currentWorkspace,
      id,
    );
  }
}
