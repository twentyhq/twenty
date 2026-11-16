import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class TestMcpToolStepInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  workflowVersionId: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  mcpServerId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  toolName: string;

  @IsOptional()
  @IsObject()
  @Field(() => graphqlTypeJson, {
    description: 'Tool arguments with workflow variables already replaced',
    nullable: true,
  })
  toolArguments?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, {
    description:
      'Must be true to run a tool that may change data, after the author confirmed it',
    nullable: true,
  })
  isDestructiveToolConfirmed?: boolean;
}
