import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ValidPasswordResetToken {
  @Field(() => Boolean)
  isValid: boolean;
}
