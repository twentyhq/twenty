import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean } from 'class-validator';

@ObjectType()
export class ResendEmailVerificationTokenOutput {
  @IsBoolean()
  @Field(() => Boolean)
  success: boolean;
}
