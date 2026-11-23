import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationConnectionPrice')
export class ApplicationConnectionPriceDTO {
  @Field()
  universalIdentifier: string;

  @Field()
  label: string;

  @Field(() => Int)
  amountCents: number;

  @Field()
  currency: string;

  @Field()
  billingPeriod: string;
}
