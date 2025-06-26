import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class IMAP_SMTP_CALDEVConnectionSuccess {
  @Field(() => Boolean)
  success: boolean;
}
