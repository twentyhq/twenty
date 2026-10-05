import { Field, ObjectType } from '@nestjs/graphql';

import { type SendInboxMessageResult } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('SendInboxMessageResult')
export class SendInboxMessageResultDTO implements SendInboxMessageResult {
  @Field(() => UUIDScalarType)
  threadId: string;
}
