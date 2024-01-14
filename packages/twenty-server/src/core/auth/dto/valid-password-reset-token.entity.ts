import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ValidPasswordResetToken {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;
}
