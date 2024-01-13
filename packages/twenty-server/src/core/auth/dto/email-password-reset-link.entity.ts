import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailPasswordResetLink {
  @Field(() => String)
  status: string;

  @Field(() => String)
  message: string;
}
