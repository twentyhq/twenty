import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/create-inter-integration.input';
import { UpdateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/update-inter-integration.input';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';

@Resolver(() => InterIntegration)
export class InterIntegrationResolver {
  constructor(
    private readonly interIntegrationService: InterIntegrationService,
  ) {}

  @Mutation(() => InterIntegration)
  async createInterIntegration(
    @Args('createInput') createInput: CreateInterIntegrationInput,
  ): Promise<InterIntegration> {
    console.log('CHEGOU NO RESOLVER VANESA');

    return this.interIntegrationService.create(createInput);
  }

  @Query(() => [InterIntegration])
  async interIntegrationsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<InterIntegration[]> {
    return this.interIntegrationService.findAll(workspaceId);
  }

  @Query(() => InterIntegration, { nullable: true })
  async interIntegrationById(
    @Args('integrationId') integrationId: string,
  ): Promise<InterIntegration | null> {
    return this.interIntegrationService.findById(integrationId);
  }

  @Mutation(() => InterIntegration)
  async updateInterIntegration(
    @Args('updateInput') updateInput: UpdateInterIntegrationInput,
  ): Promise<InterIntegration> {
    return this.interIntegrationService.update(updateInput);
  }

  @Mutation(() => String) // Alterado para retornar apenas o status
  async toggleInterIntegrationStatus(
    @Args('integrationId') integrationId: string,
  ): Promise<string> {
    const integration =
      await this.interIntegrationService.toggleStatus(integrationId);

    return integration.status;
  }

  /*@Mutation(() => Boolean)
  async deleteInterIntegration(
    @Args('integrationId') integrationId: string,
  ): Promise<boolean> {
    return this.interIntegrationService.remove(integrationId);
  }*/
}
