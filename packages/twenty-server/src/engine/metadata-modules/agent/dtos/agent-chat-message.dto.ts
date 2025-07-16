import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';

@ObjectType('AgentChatMessage')
export class AgentChatMessageDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field()
  role: 'user' | 'assistant';

  @Field()
  content: string;

  @Field(() => [FileDTO])
  files: FileDTO[];

  @Field()
  createdAt: Date;
}
