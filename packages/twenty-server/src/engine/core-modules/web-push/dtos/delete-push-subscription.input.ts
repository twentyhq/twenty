import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeletePushSubscriptionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}
