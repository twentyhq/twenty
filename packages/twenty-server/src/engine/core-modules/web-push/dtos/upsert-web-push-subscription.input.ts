import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpsertWebPushSubscriptionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  browserPublicKey: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  browserAuthSecret: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  vapidPublicKey: string;
}
