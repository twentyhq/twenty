/* @license Enterprise */

import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@MetadataResolver(() => BillingSubscriptionEntity)
export class BillingSubscriptionResolver {
  constructor(
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

  @ResolveField(() => Boolean, { nullable: true })
  async hasPaymentMethod(
    @Parent() billingSubscription: BillingSubscriptionEntity,
  ): Promise<boolean | null> {
    const billingCustomer = await this.billingCustomerRepository.findOneBy(
      billingSubscription.workspaceId,
      { stripeCustomerId: billingSubscription.stripeCustomerId },
    );

    return billingCustomer?.hasPaymentMethod ?? null;
  }
}
