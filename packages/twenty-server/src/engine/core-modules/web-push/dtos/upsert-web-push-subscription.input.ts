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
  p256dhKey: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  authSecret: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  applicationServerKey: string;
}
