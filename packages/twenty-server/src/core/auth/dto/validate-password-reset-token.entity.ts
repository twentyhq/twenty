import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ValidatePasswordResetToken {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;
}
