import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateFocusNfeIntegrationInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  @IsOptional()
  integrationName: string;

  @Field()
  @IsString()
  @IsOptional()
  token: string;

  @Field({ defaultValue: 'active' })
  @IsString()
  @IsOptional()
  status: string;
}
