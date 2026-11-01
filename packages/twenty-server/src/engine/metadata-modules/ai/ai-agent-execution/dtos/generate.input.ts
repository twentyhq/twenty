import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { type AgentResponseFormat, type AiRunScope } from 'twenty-shared/ai';
import { type GenerateMutationInput } from 'twenty-shared/application';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RunAgentMessageInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-message.input';

// mirrors generateInputSchema, which the service parses the JSON fields with
@InputType('GenerateInput')
export class GenerateInputDTO implements GenerateMutationInput {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RunAgentMessageInputDTO)
  @Field(() => [RunAgentMessageInputDTO])
  input: RunAgentMessageInputDTO[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  instructions?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  modelId?: string | null;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  responseFormat?: AgentResponseFormat | null;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  scope?: AiRunScope | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  runId?: string | null;
}
