import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthToken {
  @Field(() => String)
  token: string;

  @Field(() => Date)
  expiresAt: Date;
}
