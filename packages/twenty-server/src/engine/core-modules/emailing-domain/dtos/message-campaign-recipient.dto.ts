import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('MessageCampaignRecipient')
export class MessageCampaignRecipientDTO {
  @Field(() => String)
  messageId: string;

  @Field(() => String, { nullable: true })
  personId: string | null;

  @Field(() => String)
  displayName: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  deliveryStatus: string;

  @Field(() => String, { nullable: true })
  subject: string | null;

  @Field(() => String, { nullable: true })
  body: string | null;
}
