import { Field, InputType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateApiKeyInput {
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

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}
