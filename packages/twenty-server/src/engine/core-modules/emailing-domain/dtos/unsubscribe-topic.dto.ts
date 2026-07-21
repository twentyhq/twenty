import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UnsubscribeTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-topic-visibility.type';

registerEnumType(UnsubscribeTopicVisibility, {
  name: 'UnsubscribeTopicVisibility',
});

@ObjectType('UnsubscribeTopic')
export class UnsubscribeTopicDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => UnsubscribeTopicVisibility)
  visibility: UnsubscribeTopicVisibility;
}
