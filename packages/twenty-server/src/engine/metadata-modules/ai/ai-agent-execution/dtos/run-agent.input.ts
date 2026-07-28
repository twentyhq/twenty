import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
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

  // Exactly one of prompt or messages is enforced in AgentRunService
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field({ nullable: true })
  prompt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RunAgentMessageInputDTO)
  @Field(() => [RunAgentMessageInputDTO], { nullable: true })
  messages?: RunAgentMessageInputDTO[];
}
