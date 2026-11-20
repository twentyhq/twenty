import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { WorkflowVisibility } from 'twenty-shared/types';

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

  @Field(() => WorkflowVisibility, {
    nullable: true,
    deprecationReason: 'Use isPrivate instead',
  })
  @IsOptional()
  @IsEnum(WorkflowVisibility)
  visibility?: WorkflowVisibility;
}
