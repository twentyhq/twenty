import { Field, ID, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  privateKey?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  certificate?: string;

  @Field({ defaultValue: 'active' })
  @IsString()
  @IsOptional()
  status: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expirationDate?: Date;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
