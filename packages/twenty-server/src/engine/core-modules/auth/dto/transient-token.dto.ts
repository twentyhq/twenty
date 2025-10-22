import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';

@ObjectType()
export class TransientTokenOutput {
  @Field(() => AuthToken)
  transientToken: AuthToken;
}
