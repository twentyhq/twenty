import { ArgsType, Field } from '@nestjs/graphql';

import { IsObject, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { TrackEventName } from 'src/engine/core-modules/analytics/types/events.type';

@ArgsType()
export class CreateAnalyticsInput {
  @Field(() => String)
  @IsString()
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
  properties: JSON;
}

export function isPageviewAnalyticsInput(
  input: CreateAnalyticsInput,
): input is CreateAnalyticsInput & { name: string } {
  return input.type === 'pageview' && !!input.name;
}

export function isTrackAnalyticsInput(
  input: CreateAnalyticsInput,
): input is CreateAnalyticsInput & { event: TrackEventName } {
  return input.type === 'track' && !!input.event;
}
