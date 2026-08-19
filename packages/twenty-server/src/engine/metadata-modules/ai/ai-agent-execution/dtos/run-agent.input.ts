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
  @Field({ nullable: true })
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
  @Field(() => [RunAgentMessageInputDTO], { nullable: true })
  messages?: RunAgentMessageInputDTO[];
}
