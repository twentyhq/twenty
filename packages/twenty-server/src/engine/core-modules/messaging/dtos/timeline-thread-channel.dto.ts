import { Field, ObjectType } from '@nestjs/graphql';

import { MessageChannelType } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('TimelineThreadChannel')
export class TimelineThreadChannelDTO {
  @Field(() => MessageChannelType)
  type: MessageChannelType;

  @Field()
  provider: string;

  // Set when the channel is synced by an installed app (LinkedIn, WhatsApp...)
  @Field(() => UUIDScalarType, { nullable: true })
  applicationId: string | null;
}
