import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImapSmtpCaldavConnectionSuccess {
  @Field(() => Boolean)
  success: boolean;
}
