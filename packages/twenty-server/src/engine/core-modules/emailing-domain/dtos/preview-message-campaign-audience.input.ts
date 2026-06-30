import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsUUID } from 'class-validator';

@InputType()
export class PreviewMessageCampaignAudienceInput {
  @Field(() => String)
  @IsUUID('4')
  listId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  unsubscribeTopicId?: string;
}
