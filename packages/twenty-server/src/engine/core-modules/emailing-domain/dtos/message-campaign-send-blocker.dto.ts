import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessageCampaignSendBlockerDTO {
  @Field(() => String)
  code: string;

  @Field(() => String)
  message: string;
}
