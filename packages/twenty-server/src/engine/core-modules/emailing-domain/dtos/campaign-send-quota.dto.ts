import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('CampaignSendQuota')
export class CampaignSendQuotaDTO {
  @Field(() => Int, { nullable: true })
  dailyLimit: number | null;

  @Field(() => Int)
  used: number;

  @Field(() => Int, { nullable: true })
  remaining: number | null;
}
