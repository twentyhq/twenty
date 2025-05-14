import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateFocusNfeIntegrationInput } from 'src/engine/core-modules/focus-nfe/dtos/create-focus-nfe-integration.input';
import { UpdateFocusNfeIntegrationInput } from 'src/engine/core-modules/focus-nfe/dtos/update-focus-nfe-integration.input';
import { FocusNfeIntegration } from 'src/engine/core-modules/focus-nfe/focus-nfe-integration.entity';
import { FocusNfeService } from 'src/engine/core-modules/focus-nfe/focus-nfe-integration.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => FocusNfeIntegration)
export class FocusNfeResolver {
  constructor(private readonly focusNfeService: FocusNfeService) {}

  @Mutation(() => FocusNfeIntegration)
  async createFocusNfeIntegration(
    @Args('createInput') createInput: CreateFocusNfeIntegrationInput,
  ): Promise<FocusNfeIntegration> {
    console.log('createInput', createInput);
    const newFocusNfeIntegration =
      await this.focusNfeService.create(createInput);

    return newFocusNfeIntegration;
  }

  @Query(() => [FocusNfeIntegration])
  async getFocusNfeIntegrationsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<FocusNfeIntegration[]> {
    return await this.focusNfeService.findAll(workspaceId);
  }

  @Query(() => FocusNfeIntegration)
  async getFocusNfeIntegrationById(
    @Args('focusNfeIntegrationId') focusNfeIntegrationId: string,
  ): Promise<FocusNfeIntegration | null> {
    return await this.focusNfeService.findById(focusNfeIntegrationId);
  }

  @Mutation(() => FocusNfeIntegration)
  async updateFocusNfeIntegration(
    @Args('updateInput') updateInput: UpdateFocusNfeIntegrationInput,
  ): Promise<FocusNfeIntegration> {
    return await this.focusNfeService.update(updateInput);
  }

  @Mutation(() => Boolean)
  async deleteFocusNfeIntegration(
    @Args('focusNfeIntegrationId') focusNfeIntegrationId: string,
  ): Promise<boolean> {
    return await this.focusNfeService.delete(focusNfeIntegrationId);
  }
}
