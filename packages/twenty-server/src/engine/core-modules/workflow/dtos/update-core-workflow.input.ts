import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateCoreWorkflowInput {
  @Field(() => UUIDScalarType, { nullable: false })
  @IsUUID()
  coreWorkflowId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
