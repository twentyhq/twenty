import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CampaignSkippedRecipientsDTO {
  @Field(() => Int)
  noEmail: number;

  @Field(() => Int)
  deduped: number;

  @Field(() => Int)
  overCap: number;
}
