import { Field, InputType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @Field()
  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}
