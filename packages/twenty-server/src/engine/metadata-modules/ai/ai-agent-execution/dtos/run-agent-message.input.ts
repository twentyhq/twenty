import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { type RunAgentMessage } from 'twenty-shared/application';

import { RunAgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/enums/run-agent-message-role.enum';

@InputType('RunAgentMessageInput')
export class RunAgentMessageInputDTO implements RunAgentMessage {
  @IsEnum(RunAgentMessageRole)
  @Field(() => RunAgentMessageRole)
  role: RunAgentMessageRole;

  @IsString()
  @IsNotEmpty()
  @Field()
  content: string;
}
