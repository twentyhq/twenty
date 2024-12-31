import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VerifyEmailOutput {
  @Field(() => Boolean)
  success: boolean;
}
