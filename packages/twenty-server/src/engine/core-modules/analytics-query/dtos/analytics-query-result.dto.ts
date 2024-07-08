import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AnalyticsQueryResult')
export class AnalyticsQueryResult {
  @Field(() => String)
  analyticsQueryResult: string;
}
