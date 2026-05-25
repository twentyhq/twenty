import { Field, Float, ObjectType } from '@nestjs/graphql';

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
