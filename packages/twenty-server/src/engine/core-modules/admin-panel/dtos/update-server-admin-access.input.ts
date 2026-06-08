import { ArgsType, Field } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class UpdateServerAdminAccessInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  canAccessFullAdminPanel?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  canImpersonate?: boolean;

  // Fresh TOTP step-up code, required outside development to authorize the change.
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  otp?: string;
}
