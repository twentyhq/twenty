import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from './token.entity';

@ObjectType()
export class SignUpOutput {
  @Field(() => AuthToken)
  loginToken: AuthToken;

  @Field(() => String)
  workspaceVerifyUrl: string;
}
