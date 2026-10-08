import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsUUID,
} from 'class-validator';

import { RunAgentMessageInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-message.input';
import { RunAgentThreadInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-thread.input';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('RunAgentInput')
export class RunAgentInputDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  agentUniversalIdentifier: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field({ nullable: true, deprecationReason: 'Use input instead.' })
  prompt?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  runAsWorkspaceMemberId?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RunAgentMessageInputDTO)
  @Field(() => [RunAgentMessageInputDTO], {
    nullable: true,
    deprecationReason: 'Use input instead.',
  })
  messages?: RunAgentMessageInputDTO[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RunAgentMessageInputDTO)
  @Field(() => [RunAgentMessageInputDTO], { nullable: true })
  input?: RunAgentMessageInputDTO[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field({ nullable: true })
  additionalInstructions?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RunAgentThreadInputDTO)
  @Field(() => RunAgentThreadInputDTO, { nullable: true })
  thread?: RunAgentThreadInputDTO;
}
