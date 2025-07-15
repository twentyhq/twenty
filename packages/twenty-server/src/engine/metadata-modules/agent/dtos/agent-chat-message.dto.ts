import { Field, ID, ObjectType } from '@nestjs/graphql';

import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';

@ObjectType('AgentChatMessage')
export class AgentChatMessageDTO {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  threadId: string;

  @Field()
  role: 'user' | 'assistant';

  @Field()
  content: string;

  @Field(() => [FileDTO], { nullable: true })
  files?: FileDTO[];

  @Field()
  createdAt: Date;
}
