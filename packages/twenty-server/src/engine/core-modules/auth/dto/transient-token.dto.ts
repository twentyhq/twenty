import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';

@ObjectType('TransientToken')
export class TransientTokenDTO {
  @Field(() => AuthToken)
  transientToken: AuthToken;
}
