import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { BillingPlans } from 'src/engine/core-modules/billing-plans/billing-plans.entity';
import { BillingPlansService } from 'src/engine/core-modules/billing-plans/billing-plans.service';
import { CurrentUser } from 'src/engine/core-modules/billing-plans/current-user.decorator';
import { CreateBillingPlansInput } from 'src/engine/core-modules/billing-plans/dtos/create-billing-plans.input';
import { UpdateBillingPlansInput } from 'src/engine/core-modules/billing-plans/dtos/update-billing-plans.input';
import { User } from 'src/engine/core-modules/user/user.entity';

@Resolver(() => BillingPlans)
export class BillingPlansResolver {
  constructor(private readonly billingPlansService: BillingPlansService) {}

  @Mutation(() => BillingPlans)
  createBillingPlans(
    @Args('createBillingPlansInput')
    createBillingPlansInput: CreateBillingPlansInput,
  ): Promise<BillingPlans> {
    return this.billingPlansService.create(createBillingPlansInput);
  }

  @Mutation(() => BillingPlans)
  saveBillingPlanId(
    @Args('planId') planId: string,
    @Args('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ): Promise<BillingPlans> {
    return this.billingPlansService.savePlanId(planId, workspaceId, user.id);
  }

  @Query(() => [BillingPlans])
  getAllBillingPlans(
    @Args('workspaceId')
    workspaceId: string,
  ) {
    return this.billingPlansService.findAll(workspaceId);
  }

  @Query(() => BillingPlans)
  getBillingPlansById(@Args('id') id: string) {
    return this.billingPlansService.findById(id);
  }

  @Mutation(() => BillingPlans)
  updateBillingPlans(
    @Args('updateBillingPlansInput')
    updateBillingPlansInput: UpdateBillingPlansInput,
  ) {
    return this.billingPlansService.update(updateBillingPlansInput);
  }

  @Mutation(() => Boolean)
  removeBillingPlan(@Args('planId') planId: string) {
    return this.billingPlansService.remove(planId);
  }
}
