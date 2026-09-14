import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType('UsageQuotaScopeConsumption')
export class UsageQuotaScopeConsumptionDTO {
  @Field(() => GraphQLBigInt, { nullable: true })
  consumedValue: number | null;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;
}
