import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';

registerEnumType(MessageSuppressionReason, {
  name: 'MessageSuppressionReason',
});

registerEnumType(MessageSuppressionSource, {
  name: 'MessageSuppressionSource',
});

@ObjectType('MessageSuppression')
export class MessageSuppressionDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => String)
  emailAddress: string;

  @Field(() => MessageSuppressionReason)
  reason: MessageSuppressionReason;

  @Field(() => MessageSuppressionSource)
  source: MessageSuppressionSource;

  @Field(() => UUIDScalarType, { nullable: true })
  unsubscribeTopicId: string | null;
}

@ObjectType('MessageSuppressionList')
export class MessageSuppressionListDTO {
  @Field(() => [MessageSuppressionDTO])
  records: MessageSuppressionDTO[];

  @Field(() => Int)
  totalCount: number;
}
