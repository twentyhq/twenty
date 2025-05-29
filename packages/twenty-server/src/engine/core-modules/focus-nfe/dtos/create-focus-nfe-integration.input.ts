import { Field, ID, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateFocusNfeIntegrationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  integrationName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field({ defaultValue: 'active' })
  @IsString()
  @IsOptional()
  status: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
