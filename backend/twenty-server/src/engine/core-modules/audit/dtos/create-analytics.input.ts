import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { TrackEventName } from 'src/engine/core-modules/audit/types/events.type';
import { type PageviewProperties } from 'src/engine/core-modules/audit/utils/events/pageview/pageview';

enum AnalyticsType {
  PAGEVIEW = 'pageview',
  TRACK = 'track',
}

registerEnumType(AnalyticsType, {
  name: 'AnalyticsType',
});

// deprecated
@ArgsType()
export class CreateAnalyticsInput {
  @Field({ description: 'Type of the event' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @Field(() => GraphQLJSON, { description: 'Event payload in JSON format' })
  @IsObject()
  payload: JSON;
}

@ArgsType()
export class CreateAnalyticsInputV2 {
  @Field(() => AnalyticsType)
  @IsEnum(AnalyticsType)
  type: 'pageview' | 'track';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  event?: TrackEventName;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  properties?: PageviewProperties | Record<string, unknown>;
}

export function isPageviewAnalyticsInput(
  input: CreateAnalyticsInputV2,
): input is CreateAnalyticsInputV2 & { name: string } {
  return input.type === 'pageview' && !!input.name;
}

export function isTrackAnalyticsInput(
  input: CreateAnalyticsInputV2,
): input is CreateAnalyticsInputV2 & { event: TrackEventName } {
  return input.type === 'track' && !!input.event;
}
