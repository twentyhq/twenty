import { Field, InputType } from '@nestjs/graphql';

import {
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
}
