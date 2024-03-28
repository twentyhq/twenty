import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthorizeApp {
  @Field(() => String)
  redirectUrl: string;
}
