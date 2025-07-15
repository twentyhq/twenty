import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateWebhookDTO {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  targetUrl?: string;

  @Field(() => [String], { nullable: true })
  operations?: string[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  secret?: string;
}
