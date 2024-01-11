import { Field, ObjectType } from '@nestjs/graphql';

import { User } from 'src/core/user/user.entity';

@ObjectType()
export class ValidPasswordResetToken {
  @Field(() => User)
  user: DeepPartial<User>;
}
