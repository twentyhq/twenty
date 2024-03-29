import { Field, InputType } from '@nestjs/graphql';

import { IsDate, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateAppTokenInput {
  @IsDate()
  @IsNotEmpty()
  @Field()
  expiresAt: Date;
}
