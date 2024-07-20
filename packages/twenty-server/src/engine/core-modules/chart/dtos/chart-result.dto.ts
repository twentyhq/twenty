import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ChartResult')
export class ChartResult {
  @Field(() => String)
  chartResult: string;
}
