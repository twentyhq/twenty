import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/create-whatsapp-integration.input';
import { UpdateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/update-whatsapp-integration.input';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WhatsappWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';

@Resolver(() => WhatsappWorkspaceEntity)
export class WhatsappIntegrationResolver {
  constructor(
    private readonly whatsappIntegrationService: WhatsappIntegrationService,
  ) {}

  @Mutation(() => WhatsappWorkspaceEntity)
  async createWhatsappIntegration(
    @Args('createInput')
    createWhatsappIntegrationInput: CreateWhatsappIntegrationInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WhatsappWorkspaceEntity> {
    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    return this.whatsappIntegrationService.create(
      createWhatsappIntegrationInput,
      workspace.id,
    );
  }

  @Query(() => [WhatsappWorkspaceEntity])
  async whatsappIntegrationsByWorkspace(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WhatsappWorkspaceEntity[]> {
    return this.whatsappIntegrationService.findAll(workspace.id);
  }

  @Query(() => WhatsappWorkspaceEntity)
  async whatsappIntegrationById(
    @Args('integrationId') integrationId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WhatsappWorkspaceEntity | null> {
    return this.whatsappIntegrationService.findById(
      integrationId,
      workspace.id,
    );
  }

  @Mutation(() => WhatsappWorkspaceEntity)
  async updateWhatsappIntegration(
    @Args('updateInput')
    updateWhatsappIntegrationInput: UpdateWhatsappIntegrationInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WhatsappWorkspaceEntity> {
    return this.whatsappIntegrationService.update(
      updateWhatsappIntegrationInput,
      workspace.id,
    );
  }

  @Mutation(() => Boolean)
  async toggleWhatsappIntegrationStatus(
    @Args('integrationId') integrationId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    return this.whatsappIntegrationService.toggleStatus(
      integrationId,
      workspace.id,
    );
  }

  @Mutation(() => WhatsappWorkspaceEntity)
  updateWhatsappIntegrationServiceLevel(
    @Args('integrationId') integrationId: string,
    @Args('sla', { type: () => Int }) sla: number,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.whatsappIntegrationService.updateServiceLevel(
      integrationId,
      sla,
      workspace.id,
    );
  }
}
