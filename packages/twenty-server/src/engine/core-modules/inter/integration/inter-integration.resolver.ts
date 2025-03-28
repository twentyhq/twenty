import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateInterIntegrationInput } from 'src/engine/core-modules/inter/dtos/create-inter-integration.input';
import { UpdateInterIntegrationInput } from 'src/engine/core-modules/inter/dtos/update-inter-integration.input';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';

import { InterIntegrationService } from './inter-integration.service';

@Resolver(() => InterIntegration)
export class InterIntegrationResolver {
  constructor(
    private readonly interIntegrationService: InterIntegrationService,
  ) {}

  @Mutation(() => InterIntegration)
  createInterIntegration(
    @Args('createInput') createInput: CreateInterIntegrationInput,
  ): Promise<InterIntegration> {
    return this.interIntegrationService.create(createInput);
  }

  @Query(() => [InterIntegration])
  interIntegrationsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<InterIntegration[]> {
    return this.interIntegrationService.findAll(workspaceId);
  }

  @Query(() => InterIntegration, { nullable: true })
  interIntegrationById(
    @Args('integrationId') integrationId: string,
  ): Promise<InterIntegration | null> {
    return this.interIntegrationService.findById(integrationId);
  }

  @Mutation(() => InterIntegration)
  updateInterIntegration(
    @Args('updateInput') updateInput: UpdateInterIntegrationInput,
  ): Promise<InterIntegration> {
    return this.interIntegrationService.update(updateInput);
  }

  @Mutation(() => InterIntegration)
  toggleInterIntegrationStatus(
    @Args('integrationId') integrationId: string,
  ): Promise<InterIntegration> {
    return this.interIntegrationService.toggleStatus(integrationId);
  }

  /*@Mutation(() => Boolean)
  async deleteInterIntegration(
    @Args('integrationId') integrationId: string,
  ): Promise<boolean> {
    return this.interIntegrationService.delete(integrationId);
  }*/
}
