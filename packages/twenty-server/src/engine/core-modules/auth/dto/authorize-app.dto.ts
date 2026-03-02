import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AuthorizeApp')
export class AuthorizeAppDTO {
  @Field(() => String)
  redirectUrl: string;
}
