import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateStripeIntegrationInput } from 'src/engine/core-modules/stripe/integrations/dtos/create-stripe-integration.input';
import { UpdateStripeIntegrationInput } from 'src/engine/core-modules/stripe/integrations/dtos/update-stripe-integration.input';
import { StripeIntegration } from 'src/engine/core-modules/stripe/integrations/stripe-integration.entity';
import { StripeIntegrationService } from 'src/engine/core-modules/stripe/integrations/stripe-integration.service';

@Resolver(() => StripeIntegration)
export class StripeIntegrationResolver {
  constructor(
    private readonly stripeIntegrationService: StripeIntegrationService,
  ) {}

  @Mutation(() => StripeIntegration)
  createStripeIntegration(
    @Args('createStripeIntegrationInput')
    createStripeIntegrationInput: CreateStripeIntegrationInput,
  ): Promise<StripeIntegration> {
    return this.stripeIntegrationService.create(createStripeIntegrationInput);
  }

  @Mutation(() => StripeIntegration)
  saveStripeAccountId(
    @Args('accountId') accountId: string,
    @Args('workspaceId') workspaceId: string,
  ): Promise<StripeIntegration> {
    return this.stripeIntegrationService.saveAccountId(accountId, workspaceId);
  }

  @Query(() => [StripeIntegration])
  getAllStripeIntegrations(
    @Args('workspaceId')
    workspaceId: string,
  ) {
    return this.stripeIntegrationService.findAll(workspaceId);
  }

  @Query(() => StripeIntegration)
  getStripeIntegrationById(@Args('id') id: string) {
    return this.stripeIntegrationService.findById(id);
  }

  @Mutation(() => StripeIntegration)
  updateStripeIntegration(
    @Args('updateStripeIntegrationInput')
    updateStripeIntegrationInput: UpdateStripeIntegrationInput,
  ) {
    return this.stripeIntegrationService.update(updateStripeIntegrationInput);
  }

  @Mutation(() => Boolean)
  removeStripeIntegration(@Args('id') id: string) {
    return this.stripeIntegrationService.remove(id);
  }
}
