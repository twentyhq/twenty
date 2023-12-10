import { Field, ObjectType } from '@nestjs/graphql';

import { User } from 'src/core/user/user.entity';

import { AuthTokens } from './token.entity';

@ObjectType()
export class Verify extends AuthTokens {
  @Field(() => User)
  user: DeepPartial<User>;
}
