import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class GenerateApplicationTokenInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  applicationId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
