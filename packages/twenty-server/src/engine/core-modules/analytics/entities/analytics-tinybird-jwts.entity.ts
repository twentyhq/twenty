import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AnalyticsTinybirdJwtMap {
  @Field(() => String)
  getWebhookAnalytics: string;

  @Field(() => String)
  getPageviewsAnalytics: string;

  @Field(() => String)
  getUsersAnalytics: string;

  @Field(() => String)
  getServerlessFunctionDuration: string;

  @Field(() => String)
  getServerlessFunctionSuccessRate: string;

  @Field(() => String)
  getServerlessFunctionErrorCount: string;
}
