import { Field, InputType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { type RunAgentMessage } from 'twenty-shared/application';

@InputType('RunAgentMessageInput')
export class RunAgentMessageInputDTO implements RunAgentMessage {
  @IsString()
  @IsIn(['user', 'assistant'])
  @Field()
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @Field()
  content: string;
}
