import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelWorkspaceSubscriptionItemDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-subscription-item.dto';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

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
