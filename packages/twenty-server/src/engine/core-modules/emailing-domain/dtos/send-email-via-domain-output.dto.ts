import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SendEmailViaDomainOutput')
export class SendEmailViaDomainOutputDTO {
  @Field(() => String)
  messageId: string;
}
