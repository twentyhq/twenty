import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/create-whatsapp-integration.input';
import { UpdateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/update-whatsapp-integration.input';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';

@Resolver(() => WhatsappIntegration)
export class WhatsappIntegrationResolver {
  constructor(
    private readonly whatsappIntegrationService: WhatsappIntegrationService,
  ) {}

  @Mutation(() => WhatsappIntegration)
  async createWhatsappIntegration(
    @Args('createInput')
    createWhatsappIntegrationInput: CreateWhatsappIntegrationInput,
  ): Promise<WhatsappIntegration> {
    return this.whatsappIntegrationService.create(
      createWhatsappIntegrationInput,
    );
  }

  @Query(() => [WhatsappIntegration])
  async whatsappIntegrationsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<WhatsappIntegration[]> {
    return this.whatsappIntegrationService.findAll(workspaceId);
  }

  @Query(() => WhatsappIntegration)
  async whatsappIntegrationById(
    @Args('integrationId') integrationId: string,
  ): Promise<WhatsappIntegration | null> {
    return this.whatsappIntegrationService.findById(integrationId);
  }

  @Mutation(() => WhatsappIntegration)
  async updateWhatsappIntegration(
    @Args('updateInput')
    updateWhatsappIntegrationInput: UpdateWhatsappIntegrationInput,
  ): Promise<WhatsappIntegration> {
    return this.whatsappIntegrationService.update(
      updateWhatsappIntegrationInput,
    );
  }

  @Mutation(() => Boolean)
  async toggleWhatsappIntegrationStatus(
    @Args('integrationId') integrationId: string,
  ): Promise<boolean> {
    return this.whatsappIntegrationService.toggleStatus(integrationId);
  }

  @Mutation(() => WhatsappIntegration)
  updateWhatsappIntegrationServiceLevel(
    @Args('integrationId') integrationId: string,
    @Args('sla', { type: () => Int }) sla: number,
  ) {
    return this.whatsappIntegrationService.updateServiceLevel(
      integrationId,
      sla,
    );
  }
}
