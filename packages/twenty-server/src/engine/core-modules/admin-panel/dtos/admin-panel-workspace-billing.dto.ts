import { Field, Float, ObjectType } from '@nestjs/graphql';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

@ObjectType('AdminPanelWorkspaceSubscriptionItem')
export class AdminPanelWorkspaceSubscriptionItemDTO {
  @Field(() => String)
  productName: string;

  @Field(() => String, { nullable: true })
  productKey: string | null;

  @Field(() => String)
  stripePriceId: string;

  @Field(() => Float, { nullable: true })
  quantity: number | null;

  @Field(() => Float, { nullable: true })
  unitAmount: number | null;

  @Field(() => Float, { nullable: true })
  includedCredits: number | null;
}

@ObjectType('AdminPanelWorkspaceSubscription')
export class AdminPanelWorkspaceSubscriptionDTO {
  @Field(() => String)
  stripeSubscriptionId: string;

  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus;

  @Field(() => SubscriptionInterval, { nullable: true })
  interval: SubscriptionInterval | null;

  @Field(() => String)
  currency: string;

  @Field(() => String, { nullable: true })
  planKey: string | null;

  @Field(() => Date)
  currentPeriodStart: Date;

  @Field(() => Date)
  currentPeriodEnd: Date;

  @Field(() => Date, { nullable: true })
  trialStart: Date | null;

  @Field(() => Date, { nullable: true })
  trialEnd: Date | null;

  @Field(() => Date, { nullable: true })
  cancelAt: Date | null;

  @Field(() => Date, { nullable: true })
  canceledAt: Date | null;

  @Field(() => Boolean)
  cancelAtPeriodEnd: boolean;

  @Field(() => [AdminPanelWorkspaceSubscriptionItemDTO])
  items: AdminPanelWorkspaceSubscriptionItemDTO[];
}

@ObjectType('AdminPanelWorkspaceBilling')
export class AdminPanelWorkspaceBillingDTO {
  @Field(() => String, { nullable: true })
  stripeCustomerId: string | null;

  @Field(() => Float, { nullable: true })
  creditBalance: number | null;

  @Field(() => AdminPanelWorkspaceSubscriptionDTO, { nullable: true })
  subscription: AdminPanelWorkspaceSubscriptionDTO | null;
}
