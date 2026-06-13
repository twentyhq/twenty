import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsUUID } from 'class-validator';

@InputType()
export class PreviewMessageCampaignAudienceInput {
  // The list whose hand-picked members are the audience.
  @Field(() => String)
  @IsUUID('4')
  listId: string;

  // Optional unsubscribe topic: recipients opted out of it are counted
  // separately. When omitted, only the global opt-outs are counted.
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  unsubscribeTopicId?: string;
}
