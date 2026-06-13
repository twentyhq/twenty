import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MessageTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/message-topic-visibility.type';

registerEnumType(MessageTopicVisibility, {
  name: 'MessageTopicVisibility',
});

@ObjectType('MessageTopic')
export class MessageTopicDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => MessageTopicVisibility)
  visibility: MessageTopicVisibility;
}
