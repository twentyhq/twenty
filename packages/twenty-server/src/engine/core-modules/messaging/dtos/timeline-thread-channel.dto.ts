import { Field, ObjectType } from '@nestjs/graphql';

import { type MessagingProviderConversationStyle } from 'twenty-shared/application';
import { MessageChannelType } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('TimelineThreadChannel')
export class TimelineThreadChannelDTO {
  @Field(() => MessageChannelType)
  type: MessageChannelType;

  @Field()
  provider: string;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId: string | null;

  @Field(() => String, { nullable: true })
  conversationStyle: MessagingProviderConversationStyle | null;
}
