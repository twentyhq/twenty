import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationBillingPrice')
export class ApplicationBillingPriceDTO {
  @Field()
  universalIdentifier: string;

  @Field()
  label: string;

  @Field()
  type: string;

  @Field()
  billingPeriod: string;

  @Field(() => Int)
  amountCents: number;

  @Field()
  currency: string;

  @Field(() => String, { nullable: true })
  per: string | null;
}
