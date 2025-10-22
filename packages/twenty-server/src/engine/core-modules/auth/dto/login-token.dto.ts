import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';

@ObjectType()
export class LoginTokenOutput {
  @Field(() => AuthToken)
  loginToken: AuthToken;
}
