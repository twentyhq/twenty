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
} from 'class-validator';

import { RunAgentMessageInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-message.input';

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

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RunAgentMessageInputDTO)
  @Field(() => [RunAgentMessageInputDTO], { nullable: true })
  messages?: RunAgentMessageInputDTO[];
}
