import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthorizeAppOutput {
  @Field(() => String)
  redirectUrl: string;
}
