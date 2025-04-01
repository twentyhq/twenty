import { Field, ID, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateInterIntegrationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  integrationName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  privateKey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  certificate: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
