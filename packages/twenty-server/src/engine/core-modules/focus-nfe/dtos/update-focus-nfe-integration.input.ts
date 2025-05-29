import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateFocusNfeIntegrationInput {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  integrationName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  token: string;

  @Field({ defaultValue: 'active' })
  @IsString()
  @IsOptional()
  status: string;
}
