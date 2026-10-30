import { Field, ObjectType } from '@nestjs/graphql';

import { MessageChannelType } from 'twenty-shared/types';

@ObjectType('TimelineThreadChannel')
export class TimelineThreadChannelDTO {
  @Field(() => MessageChannelType)
  type: MessageChannelType;

  @Field()
  provider: string;

  // Name of the app connection provider (e.g. "linkedin") for APP channels
  @Field(() => String, { nullable: true })
  connectionProviderName: string | null;
}
