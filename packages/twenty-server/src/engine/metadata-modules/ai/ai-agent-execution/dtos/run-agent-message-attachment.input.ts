import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { type RunAgentMessageAttachment } from 'twenty-shared/application';

import { MAX_RUN_AGENT_ATTACHMENT_FILENAME_LENGTH } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-attachment.const';

@InputType('RunAgentMessageAttachmentInput')
export class RunAgentMessageAttachmentInputDTO implements RunAgentMessageAttachment {
  @IsUUID()
  @Field()
  fileId: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_RUN_AGENT_ATTACHMENT_FILENAME_LENGTH)
  @Field({ nullable: true })
  filename?: string;
}
