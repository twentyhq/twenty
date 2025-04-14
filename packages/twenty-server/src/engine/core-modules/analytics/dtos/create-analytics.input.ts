import { ArgsType, Field, createUnionType } from '@nestjs/graphql';

import { IsObject, IsString } from 'class-validator';

import { TrackEventName } from 'src/engine/core-modules/analytics/types/events.type';

@ArgsType()
export class PageviewAnalyticsInput {
  @Field(() => String)
  @IsString()
  type: 'pageview';

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => Object)
  @IsObject()
  properties: object;
}

@ArgsType()
export class TrackAnalyticsInput {
  @Field(() => String)
  @IsString()
  type: 'track';

  @Field(() => String)
  @IsString()
  event: TrackEventName;

  @Field(() => Object)
  @IsObject()
  properties: object;
}

export const CreateAnalyticsInput = createUnionType({
  name: 'CreateAnalyticsInput',
  types: () => [PageviewAnalyticsInput, TrackAnalyticsInput] as const,
  resolveType(value) {
    if (value.type === 'pageview') {
      return PageviewAnalyticsInput;
    }
    if (value.type === 'track') {
      return TrackAnalyticsInput;
    }

    return null;
  },
});
