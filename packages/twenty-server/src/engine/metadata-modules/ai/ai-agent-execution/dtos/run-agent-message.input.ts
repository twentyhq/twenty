import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { type RunAgentMessage } from 'twenty-shared/application';

import { MAX_RUN_AGENT_MESSAGE_ATTACHMENTS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/max-run-agent-message-attachments.const';
import { RunAgentMessageAttachmentInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-message-attachment.input';
import { RunAgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/enums/run-agent-message-role.enum';

@InputType('RunAgentMessageInput')
export class RunAgentMessageInputDTO implements RunAgentMessage {
  @IsEnum(RunAgentMessageRole)
  @Field(() => RunAgentMessageRole)
  role: RunAgentMessageRole;

  // the service refuses blank input turns; installed apps still replay blank ones through messages
  @IsString()
  @Field()
  content: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(MAX_RUN_AGENT_MESSAGE_ATTACHMENTS)
  @ValidateNested({ each: true })
  @Type(() => RunAgentMessageAttachmentInputDTO)
  @Field(() => [RunAgentMessageAttachmentInputDTO], { nullable: true })
  attachments?: RunAgentMessageAttachmentInputDTO[];
}
