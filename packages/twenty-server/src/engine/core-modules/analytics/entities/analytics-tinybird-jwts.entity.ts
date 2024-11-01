import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AnalyticsTinybirdJwtMap {
  @Field(() => String)
  getWebhookAnalytics: string;

  @Field(() => String)
  getPageviewsAnalytics: string;

  @Field(() => String)
  getUsersAnalytics: string;
}
