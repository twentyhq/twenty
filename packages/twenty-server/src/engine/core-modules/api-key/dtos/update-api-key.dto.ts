import { Field, InputType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class UpdateApiKeyDTO {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  revokedAt?: string;
}
