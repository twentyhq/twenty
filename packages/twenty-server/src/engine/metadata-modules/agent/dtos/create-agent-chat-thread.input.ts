import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateAgentChatThreadInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  agentId: string;
}
