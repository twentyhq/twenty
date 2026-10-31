import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { type AgentResponseFormat, type AiRunScope } from 'twenty-shared/ai';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { RunAgentMessageInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-message.input';

@InputType('GenerateInput')
export class GenerateInputDTO {
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
  @Field({ nullable: true })
  instructions?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field({ nullable: true })
  modelId?: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  responseFormat?: AgentResponseFormat;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  scope?: AiRunScope;
}
