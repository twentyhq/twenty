import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { TrackEventName } from 'src/engine/core-modules/audit/types/events.type';

@ArgsType()
export class CreateObjectEventInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  event: TrackEventName;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  recordId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  objectMetadataId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;
}
