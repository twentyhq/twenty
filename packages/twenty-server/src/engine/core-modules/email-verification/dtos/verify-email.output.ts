import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean } from 'class-validator';

@ObjectType()
export class VerifyEmailOutput {
  @IsBoolean()
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  email: string;
}
