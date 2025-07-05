import { Field, InputType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateApiKeyDTO {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsDateString()
  expiresAt: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  revokedAt?: string;
}
