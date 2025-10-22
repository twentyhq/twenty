import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUrl } from 'class-validator';

@InputType()
export class CreateWebhookInput {
  @Field()
  @IsNotEmpty()
  @IsUrl()
  targetUrl: string;

  @Field(() => [String])
  operations: string[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  secret?: string;
}
