import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ImapSmtpCaldavConnectionSuccess')
export class ImapSmtpCaldavConnectionSuccessDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  connectedAccountId: string;
}
