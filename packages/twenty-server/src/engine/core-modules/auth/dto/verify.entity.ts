import { Field, ObjectType } from '@nestjs/graphql';

import { User } from 'src/engine/core-modules/user/user.entity';

import { AuthTokens } from './token.entity';

@ObjectType()
export class Verify extends AuthTokens {
  @Field(() => User)
  user: DeepPartial<User>;
}
