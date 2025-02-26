import { Field, ID, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateStripeIntegrationInput {
  @Field()
  @IsString()
  accountId: string;

  @Field(() => ID)
  @IsString()
  workspaceId: string;
}
